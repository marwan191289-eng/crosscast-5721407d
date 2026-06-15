import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plug, Radio, CheckCircle2, XCircle } from "lucide-react";

const PAGE_TITLE = "Dashboard — CrossCast";
const PAGE_DESC = "Your CrossCast dashboard: listings, connected platforms, scheduled publish jobs and live success / failure stats.";
const PAGE_URL = "https://crosscast.lovable.app/dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: PAGE_URL },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const { data: stats } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      const [{ count: listings }, { count: platforms }, { count: jobs }, { count: success }, { count: failed }] = await Promise.all([
        supabase.from("listings").select("*", { count: "exact", head: true }),
        supabase.from("platforms").select("*", { count: "exact", head: true }),
        supabase.from("publish_jobs").select("*", { count: "exact", head: true }),
        supabase.from("publish_jobs").select("*", { count: "exact", head: true }).eq("status", "success"),
        supabase.from("publish_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
      ]);
      return { listings: listings ?? 0, platforms: platforms ?? 0, jobs: jobs ?? 0, success: success ?? 0, failed: failed ?? 0 };
    },
  });

  const cards = [
    { i: FileText, label: t("dashboard.listings"), value: stats?.listings, color: "text-primary" },
    { i: Plug, label: t("dashboard.platforms"), value: stats?.platforms, color: "text-accent" },
    { i: Radio, label: t("dashboard.jobs"), value: stats?.jobs, color: "text-primary-glow" },
    { i: CheckCircle2, label: t("dashboard.success"), value: stats?.success, color: "text-success" },
    { i: XCircle, label: t("dashboard.failed"), value: stats?.failed, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.welcome", { name: profile?.display_name ?? "👋" })}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ i: Icon, label, value, color }) => (
          <Card key={label} className="border-border bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`size-4 ${color}`} />
            </CardHeader>
            <CardContent><div className="text-3xl font-bold">{value ?? "—"}</div></CardContent>
          </Card>
        ))}
      </div>
      {profile?.status === "pending" && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="p-6"><p className="font-medium">{t("dashboard.pendingNote")}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
