import { describe, expect, it } from "vitest";
import { cn, formatNumber, isDefined } from "@/lib/utils";

describe("utils", () => {
  it("merges class names predictably", () => {
    expect(cn("px-2", false && "hidden", "py-4", "px-3")).toBe("py-4 px-3");
  });

  it("formats numbers using Swedish locale", () => {
    expect(formatNumber(12000)).toBe("12 000");
  });

  it("checks if value is defined", () => {
    expect(isDefined("hello")).toBe(true);
    expect(isDefined(null)).toBe(false);
  });
});
