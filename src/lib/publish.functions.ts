import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PublishInput = z.object({ jobId: z.string().uuid() });

async function runPlatform(kind: string, listing: any, platform: any): Promise<{
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
            title: listing.title,
            description: listing.description,
            price: listing.price,
            currency: listing.currency,
            category: listing.category,
            location: listing.location,
            media: listing.media,
            contact: listing.contact,
            attributes: listing.attributes,
          }),
        });
        const text = await res.text();
        let body: any = text;
        try { body = JSON.parse(text); } catch {}
        return { ok: res.ok, response: { status: res.status, body }, error: res.ok ? undefined : `HTTP ${res.status}` };
      }
      case "wordpress": {
        const url = (platform.config?.url ?? "").replace(/\/$/, "") + "/wp-json/wp/v2/posts";
        const token = platform.config?.token;
        if (!url || !token) return { ok: false, response: null, error: "missing wordpress url or token" };
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
        if (!pageId || !token) return { ok: false, response: null, error: "missing Facebook page_id or page_access_token (Graph API)" };
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
        return { ok: true, response: { note: "XML feed updated — refresh occurs when the platform pulls the feed on its schedule." } };
      case "dubizzle_export":
        return { ok: true, response: { note: "Listing queued in Dubizzle Business bulk export." } };
      default:
        return { ok: false, response: null, error: `unknown platform kind: ${kind}` };
    }
  } catch (e: any) {
    return { ok: false, response: null, error: e?.message ?? String(e) };
  }
}

export const runPublishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => PublishInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error: jobErr } = await supabase
      .from("publish_jobs").select("*, listings(*), platforms(*)")
      .eq("id", data.jobId).eq("user_id", userId).maybeSingle();
    if (jobErr || !job) throw new Error("job not found");

    await supabase.from("publish_jobs").update({
      status: "running", progress: 10, started_at: new Date().toISOString(),
    }).eq("id", job.id);

    const listing = (job as any).listings;
    const platform = (job as any).platforms;
    const result = await runPlatform(platform.kind, listing, platform);

    await supabase.from("publish_jobs").update({
      status: result.ok ? "success" : "failed",
      progress: 100,
      finished_at: new Date().toISOString(),
      response_payload: result.response,
      error_message: result.error ?? null,
      external_post_id: result.external_id ?? null,
      external_post_url: result.external_url ?? null,
    }).eq("id", job.id);

    await supabase.from("activity_log").insert({
      user_id: userId,
      action: result.ok ? "publish_success" : "publish_failed",
      entity_type: "publish_job",
      entity_id: job.id,
      metadata: { platform: platform.name, kind: platform.kind, error: result.error ?? null },
    });
    return { ok: result.ok, error: result.error };
  });

export const enqueuePublish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    listingId: z.string().uuid(),
    platformIds: z.array(z.string().uuid()).min(1),
    scheduledAt: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rows = data.platformIds.map((pid) => ({
      user_id: userId, listing_id: data.listingId, platform_id: pid,
      status: "queued" as const, scheduled_at: data.scheduledAt ?? null,
    }));
    const { data: jobs, error } = await supabase.from("publish_jobs").insert(rows).select("id");
    if (error) throw new Error(error.message);
    return { jobIds: (jobs ?? []).map((j: any) => j.id) };
  });
