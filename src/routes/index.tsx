import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Globe, Shield, Activity, LayoutDashboard, Plug } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";
import ogImage from "@/assets/og-image.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { name: "keywords", content: "cross posting, Bayut, Property Finder, Dubizzle, Facebook Marketplace, real estate UAE, listing automation" },
      { property: "og:image:alt", content: "CrossCast — publish listings to Facebook, Bayut, Property Finder, Dubizzle" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CrossCast",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "Publish once and reach Facebook Pages, Bayut, Property Finder, Dubizzle and any custom API.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();
  const features = [
    { i: Globe, t: t("landing.f1t"), d: t("landing.f1d") },
    { i: Plug, t: t("landing.f2t"), d: t("landing.f2d") },
    { i: Activity, t: t("landing.f3t"), d: t("landing.f3d") },
    { i: Zap, t: t("landing.f4t"), d: t("landing.f4d") },
    { i: LayoutDashboard, t: t("landing.f5t"), d: t("landing.f5d") },
    { i: Shield, t: t("landing.f6t"), d: t("landing.f6d") },
  ];
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--gradient-mesh)" }}>
      <div className="absolute inset-0 bg-background/40" />
      <div className="relative">
        <header className="container mx-auto flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CrossCast logo" width={40} height={40} className="rounded-xl" />
            <span className="text-lg font-semibold tracking-tight">CrossCast</span>
          </Link>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/login"><Button variant="ghost">{t("nav.login")}</Button></Link>
            <Link to="/signup">
              <Button style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                {t("nav.startFree")}
              </Button>
            </Link>
          </nav>
        </header>

        <main className="container mx-auto px-6 pt-16 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            {t("landing.badge")}
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            {t("landing.h1a")}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              {t("landing.h1b")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("landing.sub")}</p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="h-12 px-8 text-base" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}>
                {t("landing.ctaStart")}
              </Button>
            </Link>
            <Link to="/login"><Button size="lg" variant="outline" className="h-12 px-8 text-base">{t("nav.login")}</Button></Link>
          </div>

          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img src={ogImage} alt="CrossCast dashboard preview" width={1216} height={640} className="w-full" />
          </div>
        </main>

        <section className="container mx-auto grid gap-6 px-6 pb-24 md:grid-cols-3">
          {features.map(({ i: Icon, t: ti, d }) => (
            <Card key={ti} className="border-border bg-card/60 p-6 backdrop-blur">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="size-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <h3 className="text-lg font-semibold">{ti}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </section>

        <footer className="border-t border-border">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <img src={logo} alt="" width={24} height={24} />
              <span>© {new Date().getFullYear()} CrossCast</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("landing.footer")}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
