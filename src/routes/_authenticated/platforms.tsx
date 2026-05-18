import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const KINDS = [
  { v: "facebook_page", label: "Facebook Page (Graph API) — يحتاج page_id + page_access_token" },
  { v: "custom_webhook", label: "Custom Webhook / REST API" },
  { v: "wordpress", label: "WordPress (REST API)" },
  { v: "bayut_feed", label: "Bayut XML Feed" },
  { v: "property_finder_feed", label: "Property Finder XML Feed" },
  { v: "dubizzle_export", label: "Dubizzle Business Bulk" },
];

export const Route = createFileRoute("/_authenticated/platforms")({
  head: () => ({ meta: [{ title: "المنصات — CrossCast" }] }),
  component: PlatformsPage,
});

function PlatformsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["platforms-list"],
    queryFn: async () => (await supabase.from("platforms").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const toggle = useMutation({
    mutationFn: async (p: any) => (await supabase.from("platforms").update({ enabled: !p.enabled }).eq("id", p.id)).error,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms-list"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => (await supabase.from("platforms").delete().eq("id", id)).error,
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["platforms-list"] }); },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المنصات</h1>
          <p className="text-muted-foreground">إعدادات منصات النشر — يتم استخدام APIs الرسمية لكل منصة</p>
        </div>
        <NewPlatformDialog open={open} onOpenChange={setOpen} onCreated={() => qc.invalidateQueries({ queryKey: ["platforms-list"] })} />
      </div>

      {!data?.length && <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد منصات بعد. أضف أول منصة لك.</CardContent></Card>}

      <div className="grid gap-3">
        {data?.map((p: any) => (
          <Card key={p.id} className="border-border bg-card/60 backdrop-blur">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.kind}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span>{p.enabled ? "مفعّل" : "معطّل"}</span>
                  <Switch checked={p.enabled} onCheckedChange={() => toggle.mutate(p)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => del.mutate(p.id)}><Trash2 className="size-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NewPlatformDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (b: boolean) => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState("custom_webhook");
  const [config, setConfig] = useState('{\n  "url": "https://example.com/webhook"\n}');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cfg: any = {};
    try { cfg = JSON.parse(config); } catch { return toast.error("JSON غير صحيح"); }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("platforms").insert({ user_id: user.id, name, kind, config: cfg });
    if (error) return toast.error(error.message);
    toast.success("تم إضافة المنصة");
    onCreated();
    onOpenChange(false);
    setName(""); setKind("custom_webhook"); setConfig('{\n  "url": "https://example.com/webhook"\n}');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}><Plus className="size-4" /> منصة جديدة</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>إضافة منصة</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>الاسم</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>النوع</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((k) => <SelectItem key={k.v} value={k.v}>{k.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>الإعدادات (JSON)</Label>
            <Textarea rows={8} value={config} onChange={(e) => setConfig(e.target.value)} className="font-mono text-xs" />
            <p className="mt-1 text-xs text-muted-foreground">
              مثال FB: {`{ "page_id": "...", "page_access_token": "..." }`}
            </p>
          </div>
          <DialogFooter><Button type="submit">حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
