import { supabaseAdmin } from "@/integrations/supabase/client.server";

// --- SSRF guard helpers ---
const PRIVATE_HOST_RE =
  /^(localhost$|127\.|10\.|0\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|::1$|fc|fd|fe80:)/i;

function isPrivateHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "::1") return true;
  if (PRIVATE_HOST_RE.test(h)) return true;
  // metadata service hostnames
  if (h.endsWith(".internal") || h.endsWith(".local")) return true;
  return false;
}

function validateOutboundUrl(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  let u: URL;
  try { u = new URL(raw); } catch { return { ok: false, error: "invalid url" }; }
  if (u.protocol !== "https:") return { ok: false, error: "only https:// is allowed" };
  if (isPrivateHostname(u.hostname)) return { ok: false, error: "destination host is not allowed" };
  // Disallow embedded credentials
  if (u.username || u.password) return { ok: false, error: "credentials in url not allowed" };
  return { ok: true, url: u };
}

export async function runPlatform(kind: string, listing: any, platform: any): Promise<{
  ok: boolean; response: any; error?: string; external_id?: string; external_url?: string;
}> {
  try {
    switch (kind) {
      case "custom_webhook": {
        const rawUrl = platform.config?.url;
        const method = platform.config?.method ?? "POST";
        const headers = platform.config?.headers ?? {};
        const includeContact = platform.config?.include_contact === true;
        if (!rawUrl) return { ok: false, response: null, error: "missing webhook url" };
        const check = validateOutboundUrl(rawUrl);
        if (!check.ok) return { ok: false, response: null, error: `blocked webhook url: ${check.error}` };
        const payload: Record<string, any> = {
          title: listing.title, description: listing.description,
          price: listing.price, currency: listing.currency,
          category: listing.category, location: listing.location,
          media: listing.media, attributes: listing.attributes,
        };
        if (includeContact) payload.contact = listing.contact;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 10000);
        try {
          const res = await fetch(check.url.toString(), {
            method,
            redirect: "manual",
            signal: ctrl.signal,
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(payload),
          });
          const text = await res.text();
          let body: any = text; try { body = JSON.parse(text); } catch {}
          return { ok: res.ok, response: { status: res.status, body }, error: res.ok ? undefined : `HTTP ${res.status}` };
        } finally {
          clearTimeout(timer);
        }
      }
      case "wordpress": {
        const baseUrl = platform.config?.url;
        const token = platform.config?.token;
        if (!baseUrl || !token) return { ok: false, response: null, error: "missing wordpress url or token" };
        const check = validateOutboundUrl(baseUrl);
        if (!check.ok) return { ok: false, response: null, error: `blocked wordpress url: ${check.error}` };
        const url = check.url.toString().replace(/\/$/, "") + "/wp-json/wp/v2/posts";
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function verifyFeedToken(userId: string, token: string): Promise<boolean> {
  if (!userId || !token || token.length < 16) return false;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("feed_token")
    .eq("id", userId)
    .maybeSingle();
  const expected = (data as any)?.feed_token as string | undefined;
  if (!expected) return false;
  return timingSafeEqual(token, expected);
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
