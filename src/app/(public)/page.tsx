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
    <div className="space-y-16">
      <section className="border-border/80 from-primary/10 via-background to-secondary/10 rounded-3xl border bg-gradient-to-br px-8 py-16">
        <Badge variant="secondary" className="mb-4">
          Private beta · Early operators welcome
        </Badge>
        <h1 className="text-foreground max-w-3xl text-4xl leading-tight font-semibold md:text-5xl">
          Discover, compare, and operationalize traceability tooling with confidence.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Traceability Tools keeps your sourcing, ESG, and compliance teams aligned on
          what the market offers, how it integrates, and where it still falls short.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <a href="/tools">Browse tools</a>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <a href="/compare">Open comparison workspace</a>
          </Button>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Featured
            </p>
            <h2 className="text-2xl font-semibold">Curated shortlist</h2>
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

      <section className="border-border/80 bg-background/80 grid gap-8 rounded-3xl border p-10 md:grid-cols-3">
        {insightBullets.map((item) => (
          <div key={item.title} className="space-y-3">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

const insightBullets = [
  {
    title: "Living dataset",
    copy: "Daily ingestion from vendor updates, product demos, and analyst calls ensures your view is never stale.",
  },
  {
    title: "Excel-ready exports",
    copy: "Push curated shortlists into Excel or Sheets with raw feature flags so stakeholders can remix confidently.",
  },
  {
    title: "AI-assisted summaries",
    copy: "Blend narrative analysis with structured metadata to uncover risks, integration complexity, and roadmap gaps.",
  },
];
