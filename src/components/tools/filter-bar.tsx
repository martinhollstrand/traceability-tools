"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  defaultQuery?: string;
  defaultCategories?: string[];
  availableCategories?: string[];
};

export function FilterBar({
  defaultQuery = "",
  defaultCategories = [],
  availableCategories = [],
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(defaultQuery);
  const [categories, setCategories] = React.useState<string[]>(defaultCategories);
  const [categoryPickerOpen, setCategoryPickerOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState("");

  // Sync state with URL params when they change
  React.useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlCategories = searchParams.getAll("category");

    setQuery(urlQuery);
    setCategories(urlCategories);
  }, [searchParams]);

  React.useEffect(() => {
    // Clear the internal search when the picker closes.
    if (!categoryPickerOpen) {
      setCategoryFilter("");
    }
  }, [categoryPickerOpen]);

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  function updateUrl(queryValue: string, categoriesValue: string[]) {
    const params = new URLSearchParams();
    if (queryValue.trim()) {
      params.set("q", queryValue.trim());
    }
    categoriesValue.forEach((category) => params.append("category", category));

    const queryString = params.toString();
    router.push(`/tools${queryString ? `?${queryString}` : ""}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl(query, categories);
  }

  function handleReset() {
    setQuery("");
    setCategories([]);
    setCategoryFilter("");
    router.push("/tools");
  }

  const filteredCategories = React.useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return availableCategories;
    return availableCategories.filter((category) => category.toLowerCase().includes(q));
  }, [availableCategories, categoryFilter]);

  return (
    <form
      className="border-border/80 space-y-6 rounded-3xl border bg-[hsl(var(--surface))]/75 p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="text-muted-foreground mb-4 block text-sm font-semibold tracking-wider uppercase">
          Search
        </label>
        <Input
          placeholder="Search tool name, vendor, category, summary, or website…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const form = event.currentTarget.form;
              if (form) {
                handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
              }
            }
          }}
          className={cn(
            "h-16 px-6 text-base transition-all duration-200",
            query.trim()
              ? "border-primary/60 bg-primary/5 ring-primary/25 focus-visible:ring-primary/50 shadow-md ring-2 focus-visible:shadow-lg"
              : "border-border/70 hover:border-primary/30 focus-visible:border-primary/60 focus-visible:ring-primary/30 bg-[hsl(var(--background))] shadow-sm hover:shadow-md focus-visible:shadow-lg",
          )}
        />
        {query.trim() && (
          <p className="text-muted-foreground/70 mt-2.5 text-xs">
            Press Enter to search or click &quot;Apply filters&quot;
          </p>
        )}
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-muted-foreground text-xs font-semibold uppercase">
            Categories
          </label>
          {categories.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {categories.length} selected
            </span>
          )}
        </div>

        {categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="border-border/70 inline-flex items-center gap-2 rounded-full border bg-[hsl(var(--surface-strong))]/70 px-3 py-1 text-xs"
              >
                <span className="max-w-[200px] truncate">{category}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = categories.filter((item) => item !== category);
                    setCategories(next);
                    updateUrl(query, next);
                  }}
                  className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                  aria-label={`Remove category ${category}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Popover.Root open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full justify-between"
            >
              Choose categories
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              side="bottom"
              sideOffset={10}
              className="border-border/80 text-foreground z-50 max-h-[420px] w-[320px] overflow-hidden rounded-3xl border bg-[hsl(var(--surface))] p-4 shadow-[0_35px_90px_-55px_hsl(var(--primary)/0.55)]"
            >
              <div className="flex max-h-full flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Search className="text-muted-foreground h-4 w-4" />
                  <Input
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    placeholder="Filter categories…"
                    className="h-10"
                  />
                </div>

                <div className="border-border/60 min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border bg-[hsl(var(--background))] p-2">
                  {filteredCategories.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-6 text-center text-xs">
                      No categories match “{categoryFilter.trim()}”.
                    </p>
                  ) : (
                    filteredCategories.map((category) => {
                      const active = categories.includes(category);
                      return (
                        <label
                          key={category}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm hover:bg-[hsl(var(--surface-strong))]/70",
                            active && "bg-primary/5",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              const next = toggle(categories, category);
                              setCategories(next);
                              updateUrl(query, next);
                            }}
                            className="h-4 w-4"
                          />
                          <span className="flex-1">{category}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategories([]);
                      updateUrl(query, []);
                    }}
                    disabled={categories.length === 0}
                  >
                    Clear
                  </Button>
                  <Popover.Close asChild>
                    <Button type="button" variant="secondary" size="sm">
                      Done
                    </Button>
                  </Popover.Close>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
