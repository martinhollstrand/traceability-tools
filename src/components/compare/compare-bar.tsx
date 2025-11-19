"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCompare } from "@/components/compare/compare-provider";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { selected, remove, clear } = useCompare();
  const isVisible = selected.length > 0;

  const href = useMemo(() => {
    const params = new URLSearchParams();
    if (selected.length) {
      params.set("tools", selected.join(","));
    }
    return `/compare?${params.toString()}`;
  }, [selected]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-full max-w-4xl -translate-x-1/2 px-4">
      <div className="surface-card flex flex-wrap items-center gap-4 px-6 py-4">
        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
          {selected.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => remove(slug)}
              className={cn(
                "rounded-full border border-[hsl(var(--border))] px-3 py-1 text-sm hover:bg-[hsl(var(--surface-strong))]",
              )}
            >
              {slug}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          >
            Rensa
          </button>
          <Link
            href={href}
            className={cn(
              "btn-primary",
              selected.length < 2 && "pointer-events-none opacity-50",
            )}
          >
            Jämför {selected.length} verktyg
          </Link>
        </div>
      </div>
    </div>
  );
}
