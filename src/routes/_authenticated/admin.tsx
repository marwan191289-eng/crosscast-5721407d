import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Ban, Trash2 } from "lucide-react";

const ROLES = ["super_admin", "admin", "manager", "agent", "viewer"] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة — CrossCast" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/dashboard" });
  }, [loading, isAdmin, nav]);

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p: any) => ({
        ...p,
        roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "banned" | "pending" }) =>
      (await supabase.from("profiles").update({ status }).eq("id", id)).error,
    onSuccess: () => { toast.success("تم التحديث"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });
  const removeUser = useMutation({
    mutationFn: async (id: string) => (await supabase.from("profiles").delete().eq("id", id)).error,
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });
  const grant = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) =>
      (await supabase.from("user_roles").insert({ user_id, role: role as any })).error,
    onSuccess: () => { toast.success("تم منح الدور"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });
  const revoke = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) =>
      (await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role as any)).error,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
        <p className="text-muted-foreground">إدارة الحسابات والصلاحيات</p>
      </div>
      <div className="space-y-3">
        {users?.map((u: any) => (
          <Card key={u.id} className="border-border bg-card/60 backdrop-blur">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{u.display_name ?? u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.status === "active" ? "default" : u.status === "banned" ? "destructive" : "outline"}>
                    {u.status === "pending" ? "بانتظار الموافقة" : u.status === "active" ? "مفعّل" : "محظور"}
                  </Badge>
                  {u.status !== "active" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: u.id, status: "active" })}>
                      <CheckCircle2 className="size-3.5" /> تفعيل
                    </Button>
                  )}
                  {u.status !== "banned" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: u.id, status: "banned" })}>
                      <Ban className="size-3.5" /> حظر
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("حذف الحساب نهائياً؟")) removeUser.mutate(u.id); }}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">الأدوار:</span>
                {u.roles.map((r: string) => (
                  <Badge key={r} variant="secondary" className="cursor-pointer" onClick={() => revoke.mutate({ user_id: u.id, role: r })}>
                    {r} ×
                  </Badge>
                ))}
                <Select onValueChange={(v) => grant.mutate({ user_id: u.id, role: v })}>
                  <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="+ منح دور" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.filter((r) => !u.roles.includes(r)).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
