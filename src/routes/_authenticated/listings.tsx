import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { enqueuePublish, runPublishJob } from "@/lib/publish.functions";

export const Route = createFileRoute("/_authenticated/listings")({
  head: () => ({ meta: [{ title: "الإعلانات — CrossCast" }] }),
  component: ListingsPage,
});

function ListingsPage() {
  const qc = useQueryClient();
  const enqueue = useServerFn(enqueuePublish);
  const runJob = useServerFn(runPublishJob);
  const [open, setOpen] = useState(false);
  const [pubFor, setPubFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data: listings } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: platforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => (await supabase.from("platforms").select("*").eq("enabled", true)).data ?? [],
  });

  const del = useMutation({
    mutationFn: async (id: string) => (await supabase.from("listings").delete().eq("id", id)).error,
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["listings"] }); },
  });

  const publishNow = async (listingId: string) => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return toast.error("اختر منصة واحدة على الأقل");
    const { jobIds } = await enqueue({ data: { listingId, platformIds: ids } });
    toast.success(`تم إنشاء ${jobIds.length} مهمة، يتم التنفيذ...`);
    setPubFor(null);
    setSelected({});
    for (const id of jobIds) {
      runJob({ data: { jobId: id } }).catch(() => {});
    }
    qc.invalidateQueries({ queryKey: ["jobs"] });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإعلانات</h1>
          <p className="text-muted-foreground">إعلاناتك الموحّدة الجاهزة للنشر</p>
        </div>
        <NewListingDialog open={open} onOpenChange={setOpen} onCreated={() => qc.invalidateQueries({ queryKey: ["listings"] })} />
      </div>

      {!listings?.length && <Card><CardContent className="p-8 text-center text-muted-foreground">لا توجد إعلانات بعد. أضف أول إعلان لك.</CardContent></Card>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings?.map((l: any) => (
          <Card key={l.id} className="border-border bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="line-clamp-1">{l.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">{l.description}</p>
              {l.price && <p className="text-sm font-medium">{l.price} {l.currency}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setPubFor(l.id)} style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                  <Send className="size-3.5" /> نشر
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(l.id)}><Trash2 className="size-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!pubFor} onOpenChange={(o) => !o && setPubFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>اختر المنصات للنشر</DialogTitle></DialogHeader>
          {!platforms?.length ? (
            <p className="text-sm text-muted-foreground">
              لا توجد منصات مفعّلة. <Link to="/platforms" className="text-primary underline">أضِف منصة</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {platforms.map((p: any) => (
                <label key={p.id} className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-accent/10">
                  <Checkbox checked={!!selected[p.id]} onCheckedChange={(v) => setSelected((s) => ({ ...s, [p.id]: !!v }))} />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.kind}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => pubFor && publishNow(pubFor)} disabled={!platforms?.length}>تنفيذ الآن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewListingDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (b: boolean) => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", currency: "AED", category: "", location: "", kind: "ad" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("listings").insert({
      user_id: user.id, title: form.title, description: form.description,
      price: form.price ? Number(form.price) : null,
      currency: form.currency, category: form.category, location: form.location, kind: form.kind,
    });
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء الإعلان");
    onCreated();
    onOpenChange(false);
    setForm({ title: "", description: "", price: "", currency: "AED", category: "", location: "", kind: "ad" });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}><Plus className="size-4" /> إعلان جديد</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>إنشاء إعلان</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>النوع</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ad">إعلان</SelectItem>
                <SelectItem value="video">فيديو</SelectItem>
                <SelectItem value="reel">ريل</SelectItem>
                <SelectItem value="story">حالة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>العنوان</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>الوصف</Label><Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>السعر</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><Label>العملة</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>الفئة</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>الموقع</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit">حفظ</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
