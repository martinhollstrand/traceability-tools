import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { parseExcel } from "./parser";

function makeWorkbook(rows: Record<string, string>[]) {
  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return write(workbook, { type: "array", bookType: "xlsx" });
}

describe("parseExcel", () => {
  it("normalizes common headers", () => {
    const buffer = makeWorkbook([
      {
        Tool: "TracePilot",
        Vendor: "TracePilot Inc.",
        Website: "https://tracepilot.com",
      },
    ]);
    const parsed = parseExcel(buffer);
    expect(parsed[0]).toMatchObject({
      name: "TracePilot",
      vendor: "TracePilot Inc.",
      website: "https://tracepilot.com",
    });
  });
});
