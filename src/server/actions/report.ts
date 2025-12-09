"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { reportMetadataTable, adminUsersTable } from "@/server/db/schema";
import { requireAdminSession } from "@/server/auth/session";

const reportSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")), // Empty string means new report
  title: z.string().min(3),
  ingress: z.string().optional(),
  keyFindings: z.string().optional(),
  pdfUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || val.startsWith("/") || val.startsWith("http"),
      "PDF URL must be a relative path or absolute URL",
    )
    .optional()
    .or(z.literal("")),
  pdfFilename: z.string().optional(),
  pdfSize: z.coerce.number().optional(),
  isPublished: z.enum(["on", "off"]).optional().or(z.literal("")),
});

export type ReportState = {
  success: boolean;
  error?: string;
};

export async function saveReportAction(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const session = await requireAdminSession();

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

    // Get admin user ID from email (create if doesn't exist)
    let adminUserId: string | null = null;
    if (payload.pdfUrl) {
      let [adminUser] = await db
        .select({ id: adminUsersTable.id })
        .from(adminUsersTable)
        .where(eq(adminUsersTable.email, session.email))
        .limit(1);

      // If admin user doesn't exist, create it
      if (!adminUser) {
        const [newAdminUser] = await db
          .insert(adminUsersTable)
          .values({
            email: session.email,
            role: "admin",
          })
          .returning({ id: adminUsersTable.id });
        adminUser = newAdminUser;
      }

      adminUserId = adminUser?.id ?? null;
    }

    const updateData: Partial<typeof reportMetadataTable.$inferInsert> = {
      title: payload.title,
      ingress: payload.ingress,
      keyFindings,
      updatedAt: new Date(),
      previewData: {
        updatedAt: new Date().toISOString(),
      },
    };

    // Only update PDF fields if a PDF URL is provided
    if (payload.pdfUrl) {
      updateData.pdfUrl = payload.pdfUrl;
      updateData.pdfFilename = payload.pdfFilename || null;
      updateData.pdfSize = payload.pdfSize || null;
      updateData.pdfUploadedAt = new Date();
      updateData.pdfUploadedBy = adminUserId;
    } else {
      // If no PDF URL, ensure PDF fields are cleared
      updateData.pdfUrl = null;
      updateData.pdfFilename = null;
      updateData.pdfSize = null;
      updateData.pdfUploadedAt = null;
      updateData.pdfUploadedBy = null;
    }

    const isNewReport = !payload.id || payload.id === "";

    if (isNewReport) {
      // Create new report
      await db.insert(reportMetadataTable).values({
        title: payload.title,
        ingress: payload.ingress,
        keyFindings,
        pdfUrl: payload.pdfUrl || null,
        pdfFilename: payload.pdfFilename || null,
        pdfSize: payload.pdfSize || null,
        pdfUploadedAt: payload.pdfUrl ? new Date() : null,
        pdfUploadedBy: payload.pdfUrl ? adminUserId : null,
        isPublished: payload.isPublished === "on",
        previewData: {
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Update existing report
      // TypeScript guard: we know payload.id is a string here because isNewReport is false
      const reportId: string = payload.id!;
      await db
        .update(reportMetadataTable)
        .set({
          ...updateData,
          isPublished: payload.isPublished === "on",
        })
        .where(eq(reportMetadataTable.id, reportId));
    }

    revalidatePath("/report");
    revalidatePath("/admin/reports");
    revalidatePath("/admin/report");

    return { success: true };
  } catch (error) {
    console.error("Report save error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
