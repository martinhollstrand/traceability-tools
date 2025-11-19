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
          <TableHead>Tool</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Focus</TableHead>
          <TableHead className="text-right">Compare</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const isSelected = selections.includes(tool.id);
          return (
            <TableRow key={tool.id}>
              <TableCell className="font-semibold">
                <div>{tool.name}</div>
                <p className="text-muted-foreground text-xs">{tool.summary}</p>
              </TableCell>
              <TableCell>{tool.vendor}</TableCell>
              <TableCell>
                <Badge variant="secondary">{tool.category}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(tool.tags ?? tool.features ?? []).slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={isSelected ? "secondary" : "outline"}
                  onClick={() => toggle(tool.id)}
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
