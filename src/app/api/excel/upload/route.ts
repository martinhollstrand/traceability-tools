import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { parseExcel } from "@/server/excel/parser";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing Excel file" }, { status: 400 });
  }

  const maxBytes = parseInt(env.EXCEL_UPLOAD_MAX_MB, 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const rows = parseExcel(buffer);
    return NextResponse.json({ rowsCount: rows.length, preview: rows.slice(0, 5) });
  } catch (error) {
    logError(error, { scope: "excel-upload" });
    return NextResponse.json({ error: "Failed to parse workbook" }, { status: 500 });
  }
}
