"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import { toolVersionsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";

const uploadSchema = z.object({
  filename: z.string().min(1, "Filnamn saknas"),
  rowCount: z.coerce.number().nonnegative(),
  columns: z
    .string()
    .transform((value) => (value ? (JSON.parse(value) as string[]) : [])),
});

export type UploadExcelState = {
  success: boolean;
  error?: string;
};

export async function uploadExcelAction(
  _prev: UploadExcelState,
  formData: FormData,
): Promise<UploadExcelState> {
  await requireAdminSession();

  const raw = {
    filename: formData.get("filename"),
    rowCount: formData.get("rowCount"),
    columns: formData.get("columns"),
  };

  const parsed = uploadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  if (!formData.get("file")) {
    return { success: false, error: "Bifoga Excel-fil" };
  }

  try {
    const db = getDb();
    await db.insert(toolVersionsTable).values({
      label: parsed.data.filename,
      status: "processing",
      columnCount: parsed.data.columns.length,
      rowCount: parsed.data.rowCount,
      columnMappings: parsed.data.columns.reduce(
        (acc, column) => ({ ...acc, [column]: column }),
        {},
      ),
      metadata: {
        previewColumns: parsed.data.columns,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/data");
    revalidatePath("/admin/versions");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message ?? "Kunde inte spara versionen",
    };
  }
}

const activateSchema = z.object({
  versionId: z.string().min(1),
});

export async function activateVersionAction(formData: FormData) {
  await requireAdminSession();
  const parsed = activateSchema.safeParse({ versionId: formData.get("versionId") });
  if (!parsed.success) {
    return;
  }

  try {
    const db = getDb();
    await db.update(toolVersionsTable).set({ isActive: false });
    await db
      .update(toolVersionsTable)
      .set({ isActive: true, status: "ready" })
      .where(eq(toolVersionsTable.id, parsed.data.versionId));

    revalidatePath("/admin");
    revalidatePath("/admin/versions");
  } catch (error) {
    console.error(error);
  }
}
