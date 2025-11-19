import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPARE_LIMIT } from "@/lib/constants";

type CompareState = {
  selections: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      selections: [],
      toggle: (id) =>
        set((state) => {
          if (state.selections.includes(id)) {
            return { selections: state.selections.filter((item) => item !== id) };
          }
          if (state.selections.length >= COMPARE_LIMIT) {
            return state;
          }
          return { selections: [...state.selections, id] };
        }),
      clear: () => set({ selections: [] }),
    }),
    {
      name: "compare-tools",
    },
  ),
);
