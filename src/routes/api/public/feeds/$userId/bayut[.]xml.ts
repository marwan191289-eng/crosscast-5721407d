import { createFileRoute } from "@tanstack/react-router";
import { buildFeedXml } from "@/lib/publish.worker.server";

export const Route = createFileRoute("/api/public/feeds/$userId/bayut.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const xml = await buildFeedXml(params.userId, "bayut");
        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=900",
          },
        });
      },
    },
  },
});
