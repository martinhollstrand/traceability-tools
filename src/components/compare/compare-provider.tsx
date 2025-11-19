"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "traceabilitytools:selected";
const MAX_SELECTIONS = 3;

type CompareContextValue = {
  selected: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const loadInitial = (): string[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_SELECTIONS) : [];
  } catch {
    return [];
  }
};

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(() => loadInitial());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }
      if (prev.length >= MAX_SELECTIONS) {
        const [, ...rest] = prev;
        return [...rest, slug];
      }
      return [...prev, slug];
    });
  };

  const remove = (slug: string) => {
    setSelected((prev) => prev.filter((item) => item !== slug));
  };

  const clear = () => setSelected([]);

  const value = useMemo(
    () => ({
      selected,
      toggle,
      remove,
      clear,
    }),
    [selected],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
};
