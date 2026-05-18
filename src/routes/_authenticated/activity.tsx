import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "السجل — CrossCast" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const { isAdmin } = useAuth();
  const { data } = useQuery({
    queryKey: ["activity", isAdmin],
    queryFn: async () => {
      const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">سجل النشاط</h1>
        <p className="text-muted-foreground">{isAdmin ? "كل أنشطة المستخدمين" : "أنشطتك"}</p>
      </div>
      <div className="space-y-2">
        {data?.map((a: any) => (
          <Card key={a.id} className="border-border bg-card/60 backdrop-blur">
            <CardContent className="flex items-center justify-between p-3 text-sm">
              <div className="flex items-center gap-3">
                <Badge variant={a.action.includes("fail") ? "destructive" : "outline"}>{a.action}</Badge>
                <span className="text-muted-foreground">{a.entity_type}</span>
                {a.metadata && Object.keys(a.metadata).length > 0 && (
                  <span className="text-xs text-muted-foreground">· {JSON.stringify(a.metadata)}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
            </CardContent>
          </Card>
        ))}
        {!data?.length && <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد سجلات.</CardContent></Card>}
      </div>
    </div>
  );
}
