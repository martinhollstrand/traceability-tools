"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_FILTERS, FEATURE_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  defaultQuery?: string;
  defaultCategories?: string[];
  defaultTags?: string[];
};

export function FilterBar({
  defaultQuery = "",
  defaultCategories = [],
  defaultTags = [],
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(defaultQuery);
  const [categories, setCategories] = React.useState<string[]>(defaultCategories);
  const [tags, setTags] = React.useState<string[]>(defaultTags);

  // Sync state with URL params when they change
  React.useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlCategories = searchParams.getAll("category");
    const urlTags = searchParams.getAll("tag");

    setQuery(urlQuery);
    setCategories(urlCategories);
    setTags(urlTags);
  }, [searchParams]);

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  function updateUrl(queryValue: string, categoriesValue: string[], tagsValue: string[]) {
    const params = new URLSearchParams();
    if (queryValue.trim()) {
      params.set("q", queryValue.trim());
    }
    categoriesValue.forEach((category) => params.append("category", category));
    tagsValue.forEach((tag) => params.append("tag", tag));

    const queryString = params.toString();
    router.push(`/tools${queryString ? `?${queryString}` : ""}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl(query, categories, tags);
  }

  function handleReset() {
    setQuery("");
    setCategories([]);
    setTags([]);
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
          placeholder="Type to search vendors, capabilities, or compliance keywords..."
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-muted-foreground text-xs font-semibold uppercase">
            Categories
          </label>
          {categories.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {categories.length} selected
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((category) => {
            const active = categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const newCategories = toggle(categories, category);
                  setCategories(newCategories);
                  updateUrl(query, newCategories, tags);
                }}
                className={cn(
                  "relative rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  active
                    ? "border-primary bg-primary/15 text-primary ring-primary/20 shadow-sm ring-1"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-[hsl(var(--surface))]",
                )}
              >
                {category}
                {active && (
                  <span className="bg-primary absolute -top-1 -right-1 h-2 w-2 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-muted-foreground text-xs font-semibold uppercase">
            Feature tags
          </label>
          {tags.length > 0 && (
            <span className="bg-secondary/10 text-secondary-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {tags.length} selected
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FEATURE_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const newTags = toggle(tags, tag);
                  setTags(newTags);
                  updateUrl(query, categories, newTags);
                }}
                className={cn(
                  "relative rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  active
                    ? "border-secondary bg-secondary/25 text-secondary-foreground ring-secondary/20 shadow-sm ring-1"
                    : "border-border text-muted-foreground hover:border-secondary/50 hover:bg-[hsl(var(--surface))]",
                )}
              >
                {tag}
                {active && (
                  <span className="bg-secondary absolute -top-1 -right-1 h-2 w-2 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
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
