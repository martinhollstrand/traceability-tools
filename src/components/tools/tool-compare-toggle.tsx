"use client";

import { useCompare } from "@/components/compare/compare-provider";
import { cn } from "@/lib/utils";

export function ToolCompareToggle({ slug }: { slug: string }) {
  const { selected, toggle } = useCompare();
  const isSelected = selected.includes(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        isSelected
          ? "border-transparent bg-[hsl(var(--surface-strong))] text-[hsl(var(--foreground))]"
          : "border-[hsl(var(--border))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
      )}
    >
      {isSelected ? "I jämförelse" : "Jämför"}
    </button>
  );
}
