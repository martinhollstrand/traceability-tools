import { cache } from "react";
import { desc, eq } from "drizzle-orm";
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
        pdfFilename: reportMetadataTable.pdfFilename,
        pdfSize: reportMetadataTable.pdfSize,
        pdfUploadedAt: reportMetadataTable.pdfUploadedAt,
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
      pdfFilename: row.pdfFilename,
      pdfSize: row.pdfSize,
      pdfUploadedAt: row.pdfUploadedAt?.toISOString(),
      isPublished: row.isPublished,
      updatedAt: row.updatedAt?.toISOString(),
    };
  } catch (error) {
    logger.warn({ error: (error as Error).message }, "Using fallback report metadata");
    return {
      title: mockReportMetadata.title,
      ingress: mockReportMetadata.ingress,
      keyFindings: mockReportMetadata.keyFindings,
      pdfUrl: mockReportMetadata.pdfUrl,
      isPublished: mockReportMetadata.isPublished,
    };
  }
});

export const listAllReports = cache(async (): Promise<ReportMetadataPayload[]> => {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: reportMetadataTable.id,
        title: reportMetadataTable.title,
        ingress: reportMetadataTable.ingress,
        keyFindings: reportMetadataTable.keyFindings,
        pdfUrl: reportMetadataTable.pdfUrl,
        pdfFilename: reportMetadataTable.pdfFilename,
        pdfSize: reportMetadataTable.pdfSize,
        pdfUploadedAt: reportMetadataTable.pdfUploadedAt,
        isPublished: reportMetadataTable.isPublished,
        updatedAt: reportMetadataTable.updatedAt,
        createdAt: reportMetadataTable.createdAt,
      })
      .from(reportMetadataTable)
      .orderBy(desc(reportMetadataTable.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      ingress: row.ingress,
      keyFindings: row.keyFindings ?? [],
      pdfUrl: row.pdfUrl,
      pdfFilename: row.pdfFilename,
      pdfSize: row.pdfSize,
      pdfUploadedAt: row.pdfUploadedAt?.toISOString() ?? null,
      isPublished: row.isPublished,
      updatedAt: row.updatedAt?.toISOString(),
      createdAt: row.createdAt?.toISOString(),
    }));
  } catch (error) {
    logger.warn({ error: (error as Error).message }, "Failed to list reports");
    return [];
  }
});

export const getReportById = cache(
  async (id: string): Promise<ReportMetadataPayload | null> => {
    try {
      const db = getDb();
      const [row] = await db
        .select({
          id: reportMetadataTable.id,
          title: reportMetadataTable.title,
          ingress: reportMetadataTable.ingress,
          keyFindings: reportMetadataTable.keyFindings,
          pdfUrl: reportMetadataTable.pdfUrl,
          pdfFilename: reportMetadataTable.pdfFilename,
          pdfSize: reportMetadataTable.pdfSize,
          pdfUploadedAt: reportMetadataTable.pdfUploadedAt,
          isPublished: reportMetadataTable.isPublished,
          updatedAt: reportMetadataTable.updatedAt,
          createdAt: reportMetadataTable.createdAt,
        })
        .from(reportMetadataTable)
        .where(eq(reportMetadataTable.id, id))
        .limit(1);

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        title: row.title,
        ingress: row.ingress,
        keyFindings: row.keyFindings ?? [],
        pdfUrl: row.pdfUrl,
        pdfFilename: row.pdfFilename,
        pdfSize: row.pdfSize,
        pdfUploadedAt: row.pdfUploadedAt?.toISOString() ?? null,
        isPublished: row.isPublished,
        updatedAt: row.updatedAt?.toISOString(),
        createdAt: row.createdAt?.toISOString(),
      };
    } catch (error) {
      logger.warn({ error: (error as Error).message }, "Failed to get report by ID");
      return null;
    }
  },
);

export const getPublishedReport = cache(
  async (): Promise<ReportMetadataPayload | null> => {
    try {
      const db = getDb();
      const [row] = await db
        .select({
          id: reportMetadataTable.id,
          title: reportMetadataTable.title,
          ingress: reportMetadataTable.ingress,
          keyFindings: reportMetadataTable.keyFindings,
          pdfUrl: reportMetadataTable.pdfUrl,
          pdfFilename: reportMetadataTable.pdfFilename,
          pdfSize: reportMetadataTable.pdfSize,
          pdfUploadedAt: reportMetadataTable.pdfUploadedAt,
          isPublished: reportMetadataTable.isPublished,
          updatedAt: reportMetadataTable.updatedAt,
        })
        .from(reportMetadataTable)
        .where(eq(reportMetadataTable.isPublished, true))
        .orderBy(desc(reportMetadataTable.updatedAt))
        .limit(1);

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        title: row.title,
        ingress: row.ingress,
        keyFindings: row.keyFindings ?? [],
        pdfUrl: row.pdfUrl,
        pdfFilename: row.pdfFilename,
        pdfSize: row.pdfSize,
        pdfUploadedAt: row.pdfUploadedAt?.toISOString() ?? null,
        isPublished: row.isPublished,
        updatedAt: row.updatedAt?.toISOString(),
      };
    } catch (error) {
      logger.warn({ error: (error as Error).message }, "Failed to get published report");
      return null;
    }
  },
);
