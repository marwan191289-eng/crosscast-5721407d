import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";

const PAGE_TITLE = "Sign in — CrossCast";
const PAGE_DESC = "Sign in to your CrossCast account to publish real-estate listings to Facebook, Bayut, Property Finder and Dubizzle from one dashboard.";
const PAGE_URL = "https://crosscast.lovable.app/login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(t("auth.loggedIn"));
    nav({ to: "/dashboard" });
  };

  const oauth = async (provider: "google" | "apple") => {
    const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--gradient-mesh)" }}>
      <div className="absolute top-4 end-4"><LanguageSwitcher variant="outline" /></div>
      <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2"><img src={logo} alt="CrossCast" width={48} height={48} className="rounded-xl" /></Link>
          <h1 className="text-2xl font-semibold">{t("auth.loginTitle")}</h1>
          <CardTitle className="sr-only">{t("auth.loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => oauth("google")}>Google</Button>
            <Button variant="outline" onClick={() => oauth("apple")}>Apple</Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> {t("common.or")} <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pw">{t("auth.password")}</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
              {loading ? t("auth.loggingIn") : t("auth.submitLogin")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")} <Link to="/signup" className="text-primary hover:underline">{t("nav.signup")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
