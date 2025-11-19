"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { Tool } from "@/lib/validators/tool";
import { useCompareStore } from "@/store/useCompareStore";

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const selections = useCompareStore((state) => state.selections);
  const toggle = useCompareStore((state) => state.toggle);
  const isSelected = selections.some((item) => item.id === tool.id);
  const tags = tool.tags ?? tool.features ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{tool.name}</span>
          <Badge
            variant="secondary"
            className="border-primary/25 bg-primary/12 text-primary border text-[11px] font-medium tracking-[0.28em] uppercase"
          >
            {tool.category}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <p className="text-muted-foreground text-sm leading-relaxed">{tool.summary}</p>
        <div className="border-border/50 grid grid-cols-3 gap-4 rounded-2xl border bg-[hsl(var(--surface-strong))]/60 p-4 text-center text-xs shadow-[0_18px_55px_-40px_hsl(var(--primary)/0.3)]">
          <Stat label="Customers" value={tool.stats.customers.toLocaleString()} />
          <Stat label="Supply Coverage" value={formatPercent(tool.stats.coverage)} />
          <Stat label="Integrations" value={formatNumber(tool.stats.contracts)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-border/50 text-muted-foreground/90 border bg-[hsl(var(--surface))]/70 text-xs font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <a href={tool.website} target="_blank" rel="noreferrer">
              Visit site
            </a>
          </Button>
          <Button
            size="sm"
            variant={isSelected ? "secondary" : "default"}
            onClick={() =>
              toggle({
                id: tool.id,
                name: tool.name,
                slug: tool.slug,
                category: tool.category,
                summary: tool.summary,
              })
            }
            aria-pressed={isSelected}
          >
            {isSelected ? "Selected" : "Compare"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground/70 text-[11px] font-medium tracking-[0.3em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
