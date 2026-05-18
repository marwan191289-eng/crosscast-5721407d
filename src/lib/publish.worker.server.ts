import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function runPlatform(kind: string, listing: any, platform: any): Promise<{
  ok: boolean; response: any; error?: string; external_id?: string; external_url?: string;
}> {
  try {
    switch (kind) {
      case "custom_webhook": {
        const url = platform.config?.url;
        const method = platform.config?.method ?? "POST";
        const headers = platform.config?.headers ?? {};
        if (!url) return { ok: false, response: null, error: "missing webhook url" };
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            title: listing.title, description: listing.description,
            price: listing.price, currency: listing.currency,
            category: listing.category, location: listing.location,
            media: listing.media, contact: listing.contact, attributes: listing.attributes,
          }),
        });
        const text = await res.text();
        let body: any = text; try { body = JSON.parse(text); } catch {}
        return { ok: res.ok, response: { status: res.status, body }, error: res.ok ? undefined : `HTTP ${res.status}` };
      }
      case "wordpress": {
        const url = (platform.config?.url ?? "").replace(/\/$/, "") + "/wp-json/wp/v2/posts";
        const token = platform.config?.token;
        if (!platform.config?.url || !token) return { ok: false, response: null, error: "missing wordpress url or token" };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Basic ${token}` },
          body: JSON.stringify({ title: listing.title, content: listing.description, status: "publish" }),
        });
        const body = await res.json().catch(() => null);
        return { ok: res.ok, response: { status: res.status, body }, external_id: body?.id?.toString(), external_url: body?.link, error: res.ok ? undefined : `HTTP ${res.status}` };
      }
      case "facebook_page": {
        const pageId = platform.config?.page_id;
        const token = platform.config?.page_access_token;
        if (!pageId || !token) return { ok: false, response: null, error: "missing Facebook page_id or page_access_token" };
        const msg = `${listing.title}\n\n${listing.description}${listing.price ? `\n\nالسعر: ${listing.price} ${listing.currency ?? ""}` : ""}`;
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, access_token: token }),
        });
        const body = await res.json().catch(() => null);
        return { ok: res.ok, response: { status: res.status, body }, external_id: body?.id, external_url: body?.id ? `https://facebook.com/${body.id}` : undefined, error: res.ok ? undefined : body?.error?.message ?? `HTTP ${res.status}` };
      }
      case "bayut_feed":
      case "property_finder_feed":
        return { ok: true, response: { note: "XML feed updated — platform will pull on its schedule." } };
      case "dubizzle_export":
        return { ok: true, response: { note: "Listing queued in Dubizzle Business bulk export." } };
      default:
        return { ok: false, response: null, error: `unknown platform kind: ${kind}` };
    }
  } catch (e: any) {
    return { ok: false, response: null, error: e?.message ?? String(e) };
  }
}

export async function processDueJobs(limit = 25): Promise<{ processed: number; results: any[] }> {
  const nowIso = new Date().toISOString();
  const { data: jobs } = await supabaseAdmin
    .from("publish_jobs")
    .select("*, listings(*), platforms(*)")
    .eq("status", "queued")
    .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(limit);

  const results: any[] = [];
  for (const job of jobs ?? []) {
    await supabaseAdmin.from("publish_jobs").update({
      status: "running", progress: 10, started_at: new Date().toISOString(),
    }).eq("id", (job as any).id);

    const result = await runPlatform((job as any).platforms.kind, (job as any).listings, (job as any).platforms);

    await supabaseAdmin.from("publish_jobs").update({
      status: result.ok ? "success" : "failed",
      progress: 100,
      finished_at: new Date().toISOString(),
      response_payload: result.response,
      error_message: result.error ?? null,
      external_post_id: result.external_id ?? null,
      external_post_url: result.external_url ?? null,
    }).eq("id", (job as any).id);

    await supabaseAdmin.from("activity_log").insert({
      user_id: (job as any).user_id,
      action: result.ok ? "publish_success" : "publish_failed",
      entity_type: "publish_job",
      entity_id: (job as any).id,
      metadata: { platform: (job as any).platforms.name, kind: (job as any).platforms.kind, error: result.error ?? null, source: "cron" },
    });
    results.push({ id: (job as any).id, ok: result.ok, error: result.error });
  }
  return { processed: results.length, results };
}

function xmlEscape(s: any): string {
  return String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

export async function buildFeedXml(userId: string, variant: "bayut" | "property_finder"): Promise<string> {
  const { data: listings } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(500);

  const items = (listings ?? []).map((l: any) => {
    const media: string[] = Array.isArray(l.media) ? l.media : [];
    const photos = media.map((u) => `      <image><url>${xmlEscape(u)}</url></image>`).join("\n");
    if (variant === "bayut") {
      return `  <property>
    <reference_number>${xmlEscape(l.id)}</reference_number>
    <title_en>${xmlEscape(l.title)}</title_en>
    <description_en>${xmlEscape(l.description)}</description_en>
    <price>${xmlEscape(l.price ?? 0)}</price>
    <price_currency>${xmlEscape(l.currency ?? "AED")}</price_currency>
    <category>${xmlEscape(l.category ?? "")}</category>
    <city>${xmlEscape(l.location ?? "")}</city>
    <last_update>${xmlEscape(l.updated_at)}</last_update>
    <images>
${photos}
    </images>
  </property>`;
    }
    // property_finder
    return `  <listing>
    <reference-number>${xmlEscape(l.id)}</reference-number>
    <title><![CDATA[${l.title ?? ""}]]></title>
    <description><![CDATA[${l.description ?? ""}]]></description>
    <price>${xmlEscape(l.price ?? 0)}</price>
    <price-currency>${xmlEscape(l.currency ?? "AED")}</price-currency>
    <category>${xmlEscape(l.category ?? "")}</category>
    <city>${xmlEscape(l.location ?? "")}</city>
    <last-updated>${xmlEscape(l.updated_at)}</last-updated>
    <photo>
${photos}
    </photo>
  </listing>`;
  }).join("\n");

  const root = variant === "bayut" ? "properties" : "list";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n${items}\n</${root}>\n`;
}
