import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2, Ban } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "CrossCast" }] }),
  component: JobsPage,
});

const STATUS_META: Record<string, { icon: any; color: string; key: string }> = {
  queued: { icon: Clock, color: "text-muted-foreground", key: "jobs.queued" },
  running: { icon: Loader2, color: "text-primary", key: "jobs.running" },
  success: { icon: CheckCircle2, color: "text-success", key: "jobs.success" },
  failed: { icon: XCircle, color: "text-destructive", key: "jobs.failed" },
  cancelled: { icon: Ban, color: "text-muted-foreground", key: "jobs.cancelled" },
};

function JobsPage() {
  const qc = useQueryClient();
  const { t, i18n } = useTranslation();
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("publish_jobs")
        .select("*, listings(title), platforms(name, kind)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("jobs-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "publish_jobs" }, () => {
        qc.invalidateQueries({ queryKey: ["jobs"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">{t("jobs.title")}</h1>
        <p className="text-muted-foreground">{t("jobs.sub")}</p>
      </div>
      {!jobs?.length && <Card><CardContent className="p-8 text-center text-muted-foreground">{t("jobs.empty")}</CardContent></Card>}
      <div className="space-y-3">
        {jobs?.map((j: any) => {
          const s = STATUS_META[j.status] ?? STATUS_META.queued;
          const Icon = s.icon;
          return (
            <Card key={j.id} className="border-border bg-card/60 backdrop-blur">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`size-5 ${s.color} ${j.status === "running" ? "animate-spin" : ""}`} />
                    <div>
                      <div className="font-medium">{j.listings?.title ?? j.listing_id}</div>
                      <div className="text-xs text-muted-foreground">{j.platforms?.name} · {j.platforms?.kind}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{t(s.key)}</Badge>
                </div>
                <Progress value={j.progress} className="h-1.5" />
                {j.error_message && (<div className="rounded bg-destructive/10 p-2 text-xs text-destructive">{j.error_message}</div>)}
                {j.external_post_url && (
                  <a href={j.external_post_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    {t("jobs.viewPost")}
                  </a>
                )}
                {j.response_payload && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">{t("jobs.viewResponse")}</summary>
                    <pre className="mt-2 overflow-auto rounded bg-muted/40 p-2 text-[10px]">{JSON.stringify(j.response_payload, null, 2)}</pre>
                  </details>
                )}
                <div className="text-[10px] text-muted-foreground">{new Date(j.created_at).toLocaleString(i18n.language)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
