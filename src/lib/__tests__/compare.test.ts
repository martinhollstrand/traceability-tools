import { describe, expect, it } from "vitest";
import { toggleSelection, canAddSelection } from "@/lib/compare";

describe("compare utilities", () => {
  it("toggles selection when id exists", () => {
    const next = toggleSelection(["a", "b"], "a");
    expect(next).toEqual(["b"]);
  });

  it("does not exceed compare limit", () => {
    const next = toggleSelection(["a", "b", "c"], "d");
    expect(next).toEqual(["a", "b", "c"]);
  });

  it("detects available slot", () => {
    expect(canAddSelection(["a"], "b")).toBe(true);
    expect(canAddSelection(["a", "b", "c"], "d")).toBe(false);
  });
});
