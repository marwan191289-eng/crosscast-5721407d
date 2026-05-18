import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Globe, Shield, Activity, LayoutDashboard, Plug } from "lucide-react";
import logo from "@/assets/logo.png";
import ogImage from "@/assets/og-image.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { name: "keywords", content: "cross posting, Bayut, Property Finder, Dubizzle, Facebook Marketplace, real estate UAE, listing automation" },
      {
        property: "og:image:alt",
        content: "CrossCast — publish listings to Facebook, Bayut, Property Finder, Dubizzle",
      },
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
          description:
            "Publish once and reach Facebook Pages, Bayut, Property Finder, Dubizzle and any custom API.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
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
            <Link to="/login"><Button variant="ghost">تسجيل الدخول</Button></Link>
            <Link to="/signup">
              <Button style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                ابدأ مجاناً
              </Button>
            </Link>
          </nav>
        </header>

        <main className="container mx-auto px-6 pt-16 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            APIs رسمية فقط — بدون محاكاة ولا تجاوز للسياسات
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            انشر مرة واحدة.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              يصل الإعلان للجميع.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            لوحة نشر مركزية لإعلاناتك العقارية والتجارية — Facebook Pages، Bayut، Property Finder، Dubizzle،
            ومواقع مخصصة عبر REST/Webhook. كله من محرر واحد، بسجل أداء حي وجدولة ذكية.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="h-12 px-8 text-base" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}>
                ابدأ النشر الآن
              </Button>
            </Link>
            <Link to="/login"><Button size="lg" variant="outline" className="h-12 px-8 text-base">تسجيل الدخول</Button></Link>
          </div>

          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-border shadow-2xl">
            <img src={ogImage} alt="CrossCast dashboard preview" width={1216} height={640} className="w-full" />
          </div>
        </main>

        <section className="container mx-auto grid gap-6 px-6 pb-24 md:grid-cols-3">
          {[
            { i: Globe, t: "نشر متعدد المنصات", d: "Facebook Pages + Marketplace Catalog، Bayut/PF عبر XML Feeds الرسمية، Dubizzle bulk، وأي REST مخصص." },
            { i: Plug, t: "أضف منصة جديدة فوراً", d: "واجهة لإضافة أي API/Webhook — URL + Headers + قالب Body — بدون كود." },
            { i: Activity, t: "سجل تشغيل حي", d: "تابع كل مهمة لحظياً: قائمة الانتظار، التقدم، النجاح/الفشل، والرد الكامل من المنصة." },
            { i: Zap, t: "جدولة وأوقات ذروة", d: "قائمة تنفيذ منظمة + احترام rate-limits الرسمية وrefresh credits لكل منصة." },
            { i: LayoutDashboard, t: "محرر إعلان موحد", d: "نموذج واحد يتكيّف لكل منصة: عنوان، وصف، صور، سعر، فئة، موقع، تواصل." },
            { i: Shield, t: "صلاحيات وأدوار", d: "Super Admin / Admin / Manager / Agent / Viewer + موافقة على التسجيلات الجديدة." },
          ].map(({ i: Icon, t, d }) => (
            <Card key={t} className="border-border bg-card/60 p-6 backdrop-blur">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <Icon className="size-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <h3 className="text-lg font-semibold">{t}</h3>
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
            <p className="text-xs text-muted-foreground">
              نستخدم APIs الرسمية فقط، ونحترم شروط استخدام كل منصة.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
