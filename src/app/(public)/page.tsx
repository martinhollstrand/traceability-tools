import { Suspense } from "react";
import { listTools } from "@/server/data/tools";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}) {
  await params;
  await searchParams;
  const featuredTools = (await listTools()).slice(0, 3);

  return (
    <div className="space-y-20">
      <section className="border-border/40 shadow-glow relative overflow-hidden rounded-[36px] border bg-[hsl(var(--surface))]/82 px-8 py-16 sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_58%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.18),transparent_62%)]" />
        <div className="bg-primary/15 pointer-events-none absolute top-1/2 -left-24 h-64 w-64 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-accent/20 pointer-events-none absolute -top-28 right-10 h-48 w-48 rounded-full blur-3xl" />
        <div className="relative grid gap-12 md:grid-cols-[1.15fr,0.85fr] md:items-center">
          <div>
            <Badge
              variant="secondary"
              className="border-primary/30 bg-primary/15 text-primary mb-6 border"
            >
              Private beta · Early operators welcome
            </Badge>
            <h1 className="text-foreground max-w-3xl text-4xl leading-tight font-semibold md:text-6xl">
              Discover, compare, and operationalize traceability tooling with confidence.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
              Traceability Tools keeps your sourcing, ESG, and compliance teams synced on
              the market, integrations, and gaps—so you can deploy the right stack before
              the competition.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <a href="/tools">Browse tools</a>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <a href="/compare">Open comparison workspace</a>
              </Button>
            </div>
          </div>
          {/* <div className="border-border/40 relative overflow-hidden rounded-[28px] border bg-[hsl(var(--background))]/75 p-6 shadow-[0_26px_70px_-32px_hsl(var(--primary)/0.48)] backdrop-blur-xl">
            <div className="text-muted-foreground/70 mb-6 flex items-center gap-3 text-xs tracking-[0.3em] uppercase">
              Signal feeds
              <span className="via-primary/40 h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-border/40 rounded-2xl border bg-[hsl(var(--surface))]/85 p-4 text-center shadow-[0_22px_55px_-35px_hsl(var(--primary)/0.35)]"
                >
                  <p className="text-foreground text-2xl font-semibold md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px] font-medium tracking-[0.28em] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-6 space-y-3 text-sm">
              {insightBullets.slice(0, 2).map((item) => (
                <div
                  key={item.title}
                  className="border-border/30 flex items-start gap-3 rounded-2xl border bg-[hsl(var(--surface))]/65 px-4 py-3"
                >
                  <span className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-base">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-foreground font-semibold">{item.title}</p>
                    <p className="text-muted-foreground/80 text-xs">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground/80 text-xs tracking-[0.35em] uppercase">
              Featured
            </p>
            <h2 className="text-3xl font-semibold">Curated shortlist</h2>
            <p className="text-muted-foreground max-w-2xl text-sm">
              Hand-picked platforms with the strongest coverage, reliability, and
              integration velocity.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/tools">View directory</a>
          </Button>
        </div>
        <Suspense fallback={<p className="text-muted-foreground">Loading tools…</p>}>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </Suspense>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {insightBullets.map((item) => (
          <div
            key={item.title}
            className="border-border/40 relative overflow-hidden rounded-3xl border bg-[hsl(var(--surface))]/82 p-6 shadow-[0_22px_60px_-38px_hsl(var(--primary)/0.45)]"
          >
            <span className="bg-primary/12 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-lg">
              {item.icon}
            </span>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

// const heroStats = [
//   { label: "Vendors", value: "180+" },
//   { label: "Data Points", value: "48k" },
//   { label: "Countries", value: "42" },
// ];

const insightBullets = [
  {
    title: "Living dataset",
    copy: "Daily ingestion from vendor updates, product demos, and analyst calls ensures your view is never stale.",
    icon: "🛰️",
  },
  {
    title: "Excel-ready exports",
    copy: "Push curated shortlists into Excel or Sheets with raw feature flags so stakeholders can remix confidently.",
    icon: "📊",
  },
  {
    title: "AI-assisted summaries",
    copy: "Blend narrative analysis with structured metadata to uncover risks, integration complexity, and roadmap gaps.",
    icon: "🤖",
  },
];
