import { createFileRoute } from "@tanstack/react-router";
import { processDueJobs } from "@/lib/publish.worker.server";

export const Route = createFileRoute("/api/public/cron/process-jobs")({
  server: {
    handlers: {
      POST: async () => {
        const result = await processDueJobs(50);
        return Response.json({ ok: true, ...result });
      },
      GET: async () => {
        const result = await processDueJobs(50);
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
