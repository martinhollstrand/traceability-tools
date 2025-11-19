import { cache } from "react";
import { desc } from "drizzle-orm";
import { getDb } from "@/server/db";
import { reportMetadataTable } from "@/server/db/schema";
import { logger } from "@/lib/logger";
import { mockReportMetadata } from "@/server/data/mock-data";
import { type ReportMetadataPayload } from "@/server/data/types";

export const getReportMetadata = cache(async (): Promise<ReportMetadataPayload> => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        title: reportMetadataTable.title,
        ingress: reportMetadataTable.ingress,
        keyFindings: reportMetadataTable.keyFindings,
        pdfUrl: reportMetadataTable.pdfUrl,
        isPublished: reportMetadataTable.isPublished,
        updatedAt: reportMetadataTable.updatedAt,
      })
      .from(reportMetadataTable)
      .orderBy(desc(reportMetadataTable.updatedAt))
      .limit(1);

    if (rows.length === 0) {
      return {
        ...mockReportMetadata,
        ingress: mockReportMetadata.ingress ?? null,
        keyFindings: mockReportMetadata.keyFindings,
        pdfUrl: mockReportMetadata.pdfUrl ?? null,
        updatedAt: undefined,
      };
    }

    const row = rows[0];
    return {
      title: row.title,
      ingress: row.ingress,
      keyFindings: row.keyFindings ?? [],
      pdfUrl: row.pdfUrl,
      isPublished: row.isPublished,
      updatedAt: row.updatedAt?.toISOString(),
    };
  } catch (error) {
    logger.warn("Using fallback report metadata", {
      error: (error as Error).message,
    });
    return {
      title: mockReportMetadata.title,
      ingress: mockReportMetadata.ingress,
      keyFindings: mockReportMetadata.keyFindings,
      pdfUrl: mockReportMetadata.pdfUrl,
      isPublished: mockReportMetadata.isPublished,
    };
  }
});
