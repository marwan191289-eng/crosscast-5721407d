import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runPlatform } from "./publish.worker.server";

const PublishInput = z.object({ jobId: z.string().uuid() });

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
