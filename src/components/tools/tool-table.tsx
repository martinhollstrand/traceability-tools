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
  showSummaries?: boolean;
};

function mergeCategoryValues(...rawValues: Array<string | undefined>): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const rawValue of rawValues) {
    if (!rawValue) continue;

    const values = rawValue
      .split(/[;,]/)
      .map((value) => value.trim())
      .filter(Boolean);

    for (const value of values) {
      const normalized = value.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      merged.push(value);
    }
  }

  return merged;
}

export function ToolTable({ tools, showSummaries = true }: ToolTableProps) {
  const selections = useCompareStore((state) => state.selections);
  const toggle = useCompareStore((state) => state.toggle);

  return (
    <Table className="bg-[hsl(var(--surface))]/75">
      <TableHeader className="bg-[hsl(var(--surface-strong))]/70 font-bold">
        <TableRow>
          <TableHead className="min-w-[220px]">Tool</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Select</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const isSelected = selections.some((item) => item.id === tool.id);
          const categoryValues = mergeCategoryValues(
            tool.category,
            tool.secondaryCategory,
          );
          const metadata = (tool.metadata ?? {}) as Record<string, unknown>;
          const tagline =
            typeof metadata["tagline"] === "string"
              ? (metadata["tagline"] as string)
              : undefined;

          return (
            <TableRow
              key={tool.id}
              data-state={isSelected ? "selected" : undefined}
              className="transition-colors hover:bg-[hsl(var(--surface-strong))]/40"
            >
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-foreground hover:text-primary cursor-pointer text-sm font-semibold transition-colors"
                  >
                    {tool.name}
                    <p className="text-muted-foreground/60 text-[11px] font-medium">
                      {tool.vendor ? `By ${tool.vendor}` : "Vendor TBD"}
                    </p>
                  </Link>

                  {tagline && (
                    <p className="text-muted-foreground/70 text-[10px] tracking-wider">
                      {tagline}
                    </p>
                  )}
                  {showSummaries && tool.summary && (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                      {tool.summary}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="align-top">
                {categoryValues.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {categoryValues.map((category) => (
                      <Badge key={`${tool.id}-${category}`} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
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
                  {isSelected ? "Selected" : "Add to compare"}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
