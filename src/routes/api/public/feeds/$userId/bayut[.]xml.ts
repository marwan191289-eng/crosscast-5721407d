import { createFileRoute } from "@tanstack/react-router";
import { buildFeedXml, verifyFeedToken } from "@/lib/publish.worker.server";

export const Route = createFileRoute("/api/public/feeds/$userId/bayut.xml")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const ok = await verifyFeedToken(params.userId, token);
        if (!ok) return new Response("Unauthorized", { status: 401 });
        const xml = await buildFeedXml(params.userId, "bayut");
        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "private, max-age=900",
          },
        });
      },
    },
  },
});
