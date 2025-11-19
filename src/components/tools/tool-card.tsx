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
  const isSelected = selections.includes(tool.id);
  const tags = tool.tags ?? tool.features ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{tool.name}</span>
          <Badge variant="secondary">{tool.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <p className="text-muted-foreground text-sm">{tool.summary}</p>
        <div className="border-border/80 grid grid-cols-3 gap-4 rounded-xl border border-dashed p-3 text-center text-xs">
          <Stat label="Customers" value={tool.stats.customers.toLocaleString()} />
          <Stat label="Supply Coverage" value={formatPercent(tool.stats.coverage)} />
          <Stat label="Integrations" value={formatNumber(tool.stats.contracts)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline">
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
            onClick={() => toggle(tool.id)}
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
      <p className="text-muted-foreground">{label}</p>
      <p className="text-foreground text-base font-semibold">{value}</p>
    </div>
  );
}
