import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plug, Radio, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "الرئيسية — CrossCast" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">مرحباً، {profile?.display_name ?? "👋"}</h1>
        <p className="text-muted-foreground">نظرة عامة على نشاطك في CrossCast</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[
          { i: FileText, label: "إعلانات", value: stats?.listings, color: "text-primary" },
          { i: Plug, label: "منصات", value: stats?.platforms, color: "text-accent" },
          { i: Radio, label: "مهام النشر", value: stats?.jobs, color: "text-primary-glow" },
          { i: CheckCircle2, label: "نجحت", value: stats?.success, color: "text-success" },
          { i: XCircle, label: "فشلت", value: stats?.failed, color: "text-destructive" },
        ].map(({ i: Icon, label, value, color }) => (
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
          <CardContent className="p-6">
            <p className="font-medium">حسابك قيد المراجعة من قِبل الإدارة. لن تتمكن من النشر حتى تتم الموافقة.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
