"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/server/db";
import { reportMetadataTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";

const reportSchema = z.object({
  title: z.string().min(3),
  ingress: z.string().optional(),
  keyFindings: z.string().optional(),
  pdfUrl: z.string().url().optional().or(z.literal("")),
});

export type ReportState = {
  success: boolean;
  error?: string;
};

export async function saveReportAction(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  requireAdminSession();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = reportSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const payload = parsed.data;
  const keyFindings = payload.keyFindings
    ? payload.keyFindings
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  try {
    const db = getDb();
    await db
      .insert(reportMetadataTable)
      .values({
        id: "report-singleton",
        title: payload.title,
        ingress: payload.ingress,
        keyFindings,
        pdfUrl: payload.pdfUrl || null,
        isPublished: true,
        previewData: {
          updatedAt: new Date().toISOString(),
        },
      })
      .onConflictDoUpdate({
        target: reportMetadataTable.id,
        set: {
          title: payload.title,
          ingress: payload.ingress,
          keyFindings,
          pdfUrl: payload.pdfUrl || null,
          updatedAt: new Date(),
          previewData: {
            updatedAt: new Date().toISOString(),
          },
        },
      });

    revalidatePath("/report");
    revalidatePath("/admin/report");

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
