import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tool } from "@/lib/validators/tool";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

type ComparisonGridProps = {
  tools: Tool[];
  summary?: string;
};

const summaryDisabledCopy = "AI summary is disabled in this environment.";

export function ComparisonGrid({ tools, summary }: ComparisonGridProps) {
  const baseColumnWidth = 260;
  const gridTemplateColumns =
    tools.length > 0
      ? `220px repeat(${tools.length}, minmax(${baseColumnWidth}px, 1fr))`
      : "220px";
  const gridMinWidth = 220 + tools.length * baseColumnWidth;
  const gridTemplateStyle = { gridTemplateColumns };

  const rows: Array<{
    label: string;
    subtle?: boolean;
    render: (tool: Tool) => ReactNode;
  }> = [
    {
      label: "Vendor",
      render: (tool) => tool.vendor || "—",
    },
    {
      label: "Summary",
      render: (tool) => (
        <p className="text-muted-foreground text-sm leading-relaxed">
          {tool.summary || "—"}
        </p>
      ),
    },
    {
      label: "Customers",
      render: (tool) => formatNumber(tool.stats.customers),
    },
    {
      label: "Supply Coverage",
      render: (tool) => formatPercent(tool.stats.coverage, 0),
    },
    {
      label: "Integrations",
      render: (tool) => formatNumber(tool.stats.contracts),
    },
    {
      label: "Focus Tags",
      render: (tool) => {
        const tags = (tool.tags ?? tool.features ?? []).slice(0, 6);
        if (!tags.length) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      label: "Feature Signals",
      render: (tool) => {
        const entries = Object.entries(tool.featureScore ?? {}).slice(0, 3);
        if (!entries.length)
          return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
            {entries.map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-[hsl(var(--surface))]/80 px-3 py-1 text-[11px] font-medium tracking-[0.28em] uppercase"
              >
                {key}: {value.toFixed(1)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      label: "Key Details",
      subtle: true,
      render: (tool) => {
        const values = extractKeyDetails(tool);
        if (!values.length)
          return <span className="text-muted-foreground text-sm">—</span>;

        return (
          <ul className="text-muted-foreground space-y-1 text-sm">
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {summary && summary !== summaryDisabledCopy && (
        <Card className="border-primary/20 bg-[hsl(var(--surface))]/75 shadow-[0_30px_80px_-50px_hsl(var(--primary)/0.65)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gradient">AI Highlights</CardTitle>
              <p className="text-muted-foreground text-sm">
                Pattern-matched risks and strengths
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <article className="prose prose-sm text-muted-foreground max-w-none">
              <SummaryContent summary={summary} />
            </article>
          </CardContent>
        </Card>
      )}
      {summary === summaryDisabledCopy && (
        <Card className="border-border/60 bg-[hsl(var(--surface))]/65">
          <CardHeader>
            <CardTitle>AI Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              AI summaries are disabled for this environment. Add a valid API key to your
              `.env` to enable automated write-ups.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="hidden md:block">
        <div className="overflow-x-auto pb-6">
          <div
            className="border-border/50 inline-block overflow-hidden rounded-[32px] border bg-[hsl(var(--surface))]/70 shadow-[0_26px_90px_-45px_hsl(var(--primary)/0.55)]"
            style={{ minWidth: `${gridMinWidth}px` }}
          >
            <div
              className="border-border/40 grid items-stretch gap-0 border-b bg-[hsl(var(--surface-strong))]/70 px-6 py-4"
              style={gridTemplateStyle}
            >
              <div className="text-muted-foreground text-xs font-semibold tracking-[0.4em] uppercase">
                Dimension
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="flex flex-col gap-1">
                  <span className="text-foreground text-base font-semibold">
                    {tool.name}
                  </span>
                  <span className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                    {tool.category}
                  </span>
                </div>
              ))}
            </div>
            <div className="divide-border/60 divide-y">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    "grid items-start gap-0 px-6 py-5",
                    row.subtle ? "bg-background/40" : "bg-background/55",
                  )}
                  style={gridTemplateStyle}
                >
                  <div className="text-muted-foreground text-xs font-semibold tracking-[0.35em] uppercase">
                    {row.label}
                  </div>
                  {tools.map((tool) => (
                    <div key={`${tool.id}-${row.label}`} className="space-y-2">
                      {row.render(tool)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>{tool.name}</span>
                <Badge variant="secondary">{tool.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
              <p>{tool.summary}</p>
              <div className="border-border/40 grid grid-cols-3 gap-2 rounded-2xl border bg-[hsl(var(--surface))]/70 p-3 text-center text-xs">
                <StatBlock label="Customers" value={formatNumber(tool.stats.customers)} />
                <StatBlock
                  label="Coverage"
                  value={formatPercent(tool.stats.coverage, 0)}
                />
                <StatBlock
                  label="Integrations"
                  value={formatNumber(tool.stats.contracts)}
                />
              </div>
              <div>
                <p className="text-foreground font-semibold">Focus</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(tool.tags ?? tool.features ?? []).slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {(() => {
                const keyDetails = extractKeyDetails(tool);
                if (!keyDetails.length) return null;
                return (
                  <div>
                    <p className="text-foreground font-semibold">Key details</p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-xs">
                      {keyDetails.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryContent({ summary }: { summary: string }) {
  const lines = summary.split("\n").map((line) => line.trim());
  const content: ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (!currentList.length) return;
    content.push(
      <ul key={`list-${content.length}`} className="list-disc space-y-1 pl-5">
        {currentList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>,
    );
    currentList = [];
  };

  lines.forEach((line) => {
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith("- ")) {
      currentList.push(line.slice(2));
      return;
    }
    flushList();
    if (line.startsWith("### ")) {
      content.push(
        <h3
          key={`h3-${content.length}`}
          className="text-foreground text-base font-semibold"
        >
          {line.slice(4)}
        </h3>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      content.push(
        <h2
          key={`h2-${content.length}`}
          className="text-foreground text-lg font-semibold"
        >
          {line.slice(3)}
        </h2>,
      );
      return;
    }
    if (line.startsWith("# ")) {
      content.push(
        <h1
          key={`h1-${content.length}`}
          className="text-foreground text-xl font-semibold"
        >
          {line.slice(2)}
        </h1>,
      );
      return;
    }
    content.push(
      <p key={`p-${content.length}`} className="text-muted-foreground leading-relaxed">
        {line}
      </p>,
    );
  });

  flushList();

  return <Fragment>{content}</Fragment>;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground/70 tracking-[0.35em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function extractKeyDetails(tool: Tool): string[] {
  const metadata = (tool.metadata ?? {}) as Record<string, unknown>;
  const comparison = (tool.comparisonData as Record<string, unknown>) ?? {};
  const keys = [
    "pricingModel",
    "launchYear",
    "dataRefreshCadence",
    "assurancePartners",
    "deployment",
    "implementationTime",
    "dataResidency",
  ];

  const details = keys
    .map((key) => {
      const source = metadata[key] ?? comparison[key];
      if (!source) return null;
      const formatted =
        typeof source === "number" || typeof source === "string"
          ? source
          : JSON.stringify(source);
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return `${label}: ${formatted}`;
    })
    .filter(Boolean) as string[];

  if (!details.length && typeof metadata["tagline"] === "string") {
    details.push(metadata["tagline"] as string);
  }

  return details;
}
