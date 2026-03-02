"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import { toolVersionsTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import {
  parseUploadFormData,
  runToolVersionImport,
} from "@/server/import/tool-version-import";

export type UploadExcelState = {
  success: boolean;
  error?: string;
};

export async function uploadExcelAction(
  _prev: UploadExcelState,
  formData: FormData,
): Promise<UploadExcelState> {
  await requireAdminSession();

  const parsed = parseUploadFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  try {
    await runToolVersionImport(parsed.data);
    return { success: true };
  } catch (error) {
    console.error("Import error:", error);
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
