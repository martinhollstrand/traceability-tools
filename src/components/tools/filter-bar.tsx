"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(
    defaultCategories.length > 0,
  );

  // Sync state with URL params when they change
  React.useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlCategories = searchParams.getAll("category");

    setQuery(urlQuery);
    setCategories(urlCategories);
    if (urlCategories.length > 0) setCategoriesExpanded(true);
  }, [searchParams]);

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  function updateUrl(queryValue: string, categoriesValue: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    const sort = params.get("sort");
    const newParams = new URLSearchParams();
    if (queryValue.trim()) {
      newParams.set("q", queryValue.trim());
    }
    categoriesValue.forEach((category) => newParams.append("category", category));
    if (sort) newParams.set("sort", sort);

    const queryString = newParams.toString();
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
    setCategoriesExpanded(false);
    router.push("/tools");
  }

  const filteredCategories = React.useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return availableCategories;
    return availableCategories.filter((category) => category.toLowerCase().includes(q));
  }, [availableCategories, categoryFilter]);

  return (
    <form
      className="border-border/80 space-y-4 rounded-3xl border bg-[hsl(var(--surface))]/75 p-5"
      onSubmit={handleSubmit}
    >
      {/* Search — compact */}
      <div>
        <label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
          Search
        </label>
        <Input
          placeholder="Search tools…"
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
            "h-11 px-4 text-sm transition-all duration-200",
            query.trim()
              ? "border-primary/60 bg-primary/5 ring-primary/25 focus-visible:ring-primary/50 shadow-md ring-2 focus-visible:shadow-lg"
              : "border-border/70 hover:border-primary/30 focus-visible:border-primary/60 focus-visible:ring-primary/30 bg-[hsl(var(--background))] shadow-sm hover:shadow-md focus-visible:shadow-lg",
          )}
        />
        <p className="text-muted-foreground/60 mt-1.5 text-[10px]">
          Searches name, vendor, category, summary, and website
        </p>
      </div>

      {/* Categories — collapsible */}
      <div>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-end gap-2"
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
        >
          {categories.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {categories.length}
            </span>
          )}
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Categories
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform duration-200",
              categoriesExpanded && "rotate-180",
            )}
          />
        </button>

        {/* Selected category chips always visible */}
        {!categoriesExpanded && categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span
                key={category}
                className="border-border/70 inline-flex items-center gap-1.5 rounded-full border bg-[hsl(var(--surface-strong))]/70 px-2.5 py-0.5 text-[11px]"
              >
                <span className="max-w-[160px] truncate">{category}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = categories.filter((item) => item !== category);
                    setCategories(next);
                    updateUrl(query, next);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5"
                  aria-label={`Remove category ${category}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {categoriesExpanded && (
          <div className="mt-3 space-y-2">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="border-border/70 inline-flex items-center gap-1.5 rounded-full border bg-[hsl(var(--surface-strong))]/70 px-2.5 py-0.5 text-[11px]"
                  >
                    <span className="max-w-[160px] truncate">{category}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = categories.filter((item) => item !== category);
                        setCategories(next);
                        updateUrl(query, next);
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5"
                      aria-label={`Remove category ${category}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {availableCategories.length > 8 && (
              <div className="flex items-center gap-2">
                <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <Input
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Filter categories…"
                  className="h-8 text-xs"
                />
              </div>
            )}

            <div className="border-border/60 max-h-[260px] space-y-0.5 overflow-y-auto overscroll-contain rounded-2xl border bg-[hsl(var(--background))] p-1.5">
              {filteredCategories.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                  No categories match &quot;{categoryFilter.trim()}&quot;.
                </p>
              ) : (
                filteredCategories.map((category) => {
                  const active = categories.includes(category);
                  return (
                    <label
                      key={category}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-[hsl(var(--surface-strong))]/70",
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
                        className="h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="flex-1 text-[13px]">{category}</span>
                    </label>
                  );
                })
              )}
            </div>
            {categories.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setCategories([]);
                  updateUrl(query, []);
                }}
              >
                Clear categories
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" size="sm">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
