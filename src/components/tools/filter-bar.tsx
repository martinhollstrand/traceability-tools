"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  // Sync state with URL params when they change
  React.useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlCategories = searchParams.getAll("category");

    setQuery(urlQuery);
    setCategories(urlCategories);
  }, [searchParams]);

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
    router.push("/tools");
  }

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
        <div className="mb-2 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase"
            onClick={() => setCategoriesOpen((open) => !open)}
            aria-expanded={categoriesOpen}
            aria-controls="tool-categories"
          >
            Categories
            <span className="text-muted-foreground/60 normal-case">
              {categoriesOpen ? "Hide" : "Show"}
            </span>
          </button>
          {categories.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {categories.length} selected
            </span>
          )}
        </div>

        {!categoriesOpen && categories.length > 0 && (
          <p className="text-muted-foreground/80 text-xs">
            {categories.slice(0, 3).join(", ")}
            {categories.length > 3 ? ` +${categories.length - 3} more` : ""}
          </p>
        )}

        {categoriesOpen && (
          <div id="tool-categories" className="mt-2 flex max-h-80 flex-wrap gap-2">
            {availableCategories.length === 0 ? (
              <p className="text-muted-foreground text-xs">No categories available</p>
            ) : (
              availableCategories.map((category) => {
                const active = categories.includes(category);
                return (
                  <Button
                    key={category}
                    variant={active ? "selected" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newCategories = toggle(categories, category);
                      setCategories(newCategories);
                      updateUrl(query, newCategories);
                    }}
                  >
                    {category}
                  </Button>
                );
              })
            )}
          </div>
        )}
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
