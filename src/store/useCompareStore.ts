import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPARE_LIMIT } from "@/lib/constants";

export type CompareSelection = {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  summary?: string;
};

type CompareState = {
  selections: CompareSelection[];
  toggle: (selection: CompareSelection) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      selections: [],
      toggle: (selection) =>
        set((state) => {
          const exists = state.selections.some((item) => item.id === selection.id);
          if (exists) {
            return {
              selections: state.selections.filter((item) => item.id !== selection.id),
            };
          }
          if (state.selections.length >= COMPARE_LIMIT) {
            const [, ...rest] = state.selections;
            return { selections: [...rest, selection] };
          }
          return { selections: [...state.selections, selection] };
        }),
      remove: (id) =>
        set((state) => ({
          selections: state.selections.filter((item) => item.id !== id),
        })),
      clear: () => set({ selections: [] }),
    }),
    {
      name: "compare-tools",
      partialize: (state) => ({
        selections: state.selections,
      }),
    },
  ),
);
