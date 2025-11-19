"use client";

import { useCompareStore } from "@/store/useCompareStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tool } from "@/lib/validators/tool";

type ToolTableProps = {
  tools: Tool[];
};

export function ToolTable({ tools }: ToolTableProps) {
  const selections = useCompareStore((state) => state.selections);
  const toggle = useCompareStore((state) => state.toggle);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[220px]">Tool</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Regions</TableHead>
          <TableHead className="min-w-[200px]">Focus</TableHead>
          <TableHead className="min-w-[180px]">Snapshot</TableHead>
          <TableHead className="text-right">Compare</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const isSelected = selections.some((item) => item.id === tool.id);
          const tags = (tool.tags ?? tool.features ?? []).slice(0, 4);
          const metadata = (tool.metadata ?? {}) as Record<string, unknown>;
          const tagline =
            typeof metadata["tagline"] === "string"
              ? (metadata["tagline"] as string)
              : undefined;
          const regions = Array.isArray(tool.regions)
            ? tool.regions.slice(0, 3)
            : Array.isArray(metadata["regions"])
              ? (metadata["regions"] as string[]).slice(0, 3)
              : [];
          const summary = tool.summary || "No summary provided.";

          return (
            <TableRow key={tool.id} data-state={isSelected ? "selected" : undefined}>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">
                      {tool.name}
                    </span>
                    {tagline && (
                      <Badge
                        variant="outline"
                        className="text-[10px] tracking-wider uppercase"
                      >
                        {tagline}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                    {summary}
                  </p>
                  <p className="text-muted-foreground/80 text-[11px]">
                    {tool.vendor ? `By ${tool.vendor}` : "Vendor TBD"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <Badge variant="secondary">{tool.category}</Badge>
              </TableCell>
              <TableCell className="align-top">
                <div className="text-muted-foreground flex flex-wrap gap-1 text-xs">
                  {regions.length ? (
                    regions.map((region) => (
                      <span
                        key={region}
                        className="rounded-full bg-[hsl(var(--surface))] px-2 py-0.5"
                      >
                        {region}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground/70">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1">
                  {tags.length ? (
                    tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground align-top text-sm">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-muted-foreground/70 tracking-[0.28em] uppercase">
                      Cust
                    </p>
                    <p className="text-foreground font-semibold">
                      {tool.stats.customers}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/70 tracking-[0.28em] uppercase">
                      Cover
                    </p>
                    <p className="text-foreground font-semibold">
                      {(tool.stats.coverage * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/70 tracking-[0.28em] uppercase">
                      Integr
                    </p>
                    <p className="text-foreground font-semibold">
                      {tool.stats.contracts}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right align-top">
                <Button
                  size="sm"
                  variant={isSelected ? "secondary" : "outline"}
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
