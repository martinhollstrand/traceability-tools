import "server-only";

import { read, utils } from "xlsx";
import { z } from "zod";

const excelRowSchema = z.record(z.string());

export function parseExcel(buffer: ArrayBuffer) {
  const workbook = read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const json = utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "" });

  const parsedRows = json.map((row) => excelRowSchema.parse(row));

  return parsedRows.map(normalizeRow);
}

const HEADER_MAP: Record<string, string> = {
  name: "name",
  tool: "name",
  vendor: "vendor",
  provider: "vendor",
  summary: "summary",
  description: "summary",
  website: "website",
  url: "website",
  category: "category",
  tags: "features",
};

function normalizeRow(row: Record<string, string>) {
  return Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
    const normalizedKey = HEADER_MAP[key.toLowerCase()] ?? key.toLowerCase();
    acc[normalizedKey] = value;
    return acc;
  }, {});
}
