import { createFileRoute } from "@tanstack/react-router";
import { processDueJobs } from "@/lib/publish.worker.server";

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function checkAuth(request: Request): boolean {
  const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!expected) return false;
  const apikey = request.headers.get("apikey") ?? request.headers.get("x-apikey");
  const auth = request.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;
  return apikey === expected || bearer === expected;
}

export const Route = createFileRoute("/api/public/cron/process-jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAuth(request)) return unauthorized();
        const result = await processDueJobs(50);
        return Response.json({ ok: true, ...result });
      },
      GET: async ({ request }) => {
        if (!checkAuth(request)) return unauthorized();
        const result = await processDueJobs(50);
        return Response.json({ ok: true, ...result });
      },
    },
  },
});
