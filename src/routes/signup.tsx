import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "إنشاء حساب — CrossCast" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("كلمة المرور 8 أحرف على الأقل");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء الحساب — في انتظار موافقة الإدارة");
    nav({ to: "/dashboard" });
  };

  const oauth = async (provider: "google" | "apple") => {
    const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error(res.error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--gradient-mesh)" }}>
      <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2"><img src={logo} alt="CrossCast" width={48} height={48} className="rounded-xl" /></Link>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => oauth("google")}>Google</Button>
            <Button variant="outline" onClick={() => oauth("apple")}>Apple</Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> أو <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="n">الاسم الكامل</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="e">البريد الإلكتروني</Label>
              <Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="p">كلمة المرور</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
              {loading ? "..." : "إنشاء الحساب"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            لديك حساب؟ <Link to="/login" className="text-primary hover:underline">دخول</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
