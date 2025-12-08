"use client";

import Link from "next/link";
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
    <Table className="bg-[hsl(var(--surface))]/75">
      <TableHeader className="bg-[hsl(var(--surface-strong))]/70 font-bold">
        <TableRow>
          <TableHead className="min-w-[220px]">Tool</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="min-w-[200px]">Focus</TableHead>
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
          const summary = tool.summary || "No summary provided.";

          return (
            <TableRow key={tool.id} data-state={isSelected ? "selected" : undefined}>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-foreground hover:text-primary text-sm font-semibold transition-colors"
                  >
                    {tool.name}
                  </Link>
                  {tagline && (
                    <p className="text-muted-foreground/70 text-[10px] tracking-wider uppercase">
                      {tagline}
                    </p>
                  )}
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
              <TableCell className="text-right align-top">
                <Button
                  size="sm"
                  variant={isSelected ? "selected" : "secondary"}
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
