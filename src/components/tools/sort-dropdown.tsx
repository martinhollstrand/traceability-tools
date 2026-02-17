"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "category", label: "Category" },
  { value: "updated", label: "Recently updated" },
] as const;

type SortDropdownProps = {
  currentSort: string;
};

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "name") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const queryString = params.toString();
    router.push(`/tools${queryString ? `?${queryString}` : ""}`);
  }

  const activeLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Name (A-Z)";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap">
          <ArrowUpDown className="h-4 w-4" />
          <span className="text-muted-foreground text-xs">Sort:</span>
          <span className="text-xs font-medium">{activeLabel}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          side="bottom"
          sideOffset={6}
          className="border-border/80 z-50 min-w-[180px] rounded-xl border bg-[hsl(var(--surface))] p-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <Popover.Close key={option.value} asChild>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[hsl(var(--surface-strong))]/70",
                  currentSort === option.value &&
                    "bg-primary/10 text-primary font-medium",
                )}
              >
                {option.label}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
