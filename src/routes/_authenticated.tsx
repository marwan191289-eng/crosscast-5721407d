import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Plug, Activity, Shield, LogOut, Radio } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated")({ component: AuthLayout });

function AuthLayout() {
  const { user, loading, isAdmin, profile, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useTranslation();

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  const nav_items = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/listings", icon: FileText, label: t("nav.listings") },
    { to: "/platforms", icon: Plug, label: t("nav.platforms") },
    { to: "/jobs", icon: Radio, label: t("nav.jobs") },
    { to: "/activity", icon: Activity, label: t("nav.activity") },
  ] as const;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--gradient-mesh)" }}>
      <aside className="hidden w-64 flex-col border-l border-border bg-sidebar/80 backdrop-blur md:flex">
        <Link to="/dashboard" className="flex items-center gap-2 border-b border-border px-5 py-4">
          <img src={logo} alt="" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold">CrossCast</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {nav_items.map(({ to, icon: Icon, label }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${loc.pathname.startsWith("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"}`}>
              <Shield className="size-4" /> {t("nav.admin")}
            </Link>
          )}
        </nav>
        <div className="border-t border-border p-3 space-y-2">
          <div className="px-2 text-xs text-muted-foreground">
            {profile?.display_name || profile?.email}
            {profile?.status === "pending" && <div className="mt-1 rounded bg-warning/20 px-2 py-0.5 text-warning">{t("dashboard.pending")}</div>}
            {profile?.status === "banned" && <div className="mt-1 rounded bg-destructive/20 px-2 py-0.5 text-destructive">{t("dashboard.banned")}</div>}
          </div>
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/" }); }}>
              <LogOut className="size-4" /> {t("nav.logout")}
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-background/40">
        <Outlet />
      </main>
    </div>
  );
}
