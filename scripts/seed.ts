import "./utils/load-env";

import { db } from "../src/server/db";
import {
  reportMetadataTable,
  toolsTable,
  toolVersionsTable,
} from "../src/server/db/schema";
import { seedToolDataset } from "../src/server/data/seed-data";

const HOURS = 60 * 60 * 1000;
const SEED_VERSION_TAG = "2025-q1";

async function runSeed() {
  const now = new Date();

  await db.transaction(async (tx) => {
    // Clear existing data from dependent tables first
    await tx.delete(reportMetadataTable);
    await tx.delete(toolsTable);
    await tx.delete(toolVersionsTable);

    const versions = [
      {
        label: "2025.1 · Market Pulse Import",
        status: "ready" as const,
        columnMappings: {},
        columnCount: 28,
        rowCount: seedToolDataset.length,
        isActive: true,
        diffSummary: {},
        metadata: { source: "seed", tag: SEED_VERSION_TAG },
      },
      {
        label: "2024.4 · Historical Archive",
        status: "ready" as const,
        columnMappings: {},
        columnCount: 24,
        rowCount: 58,
        isActive: false,
        diffSummary: {},
        metadata: { source: "seed", tag: "2024-q4" },
      },
      {
        label: "Preview · Upcoming Vendor Refresh",
        status: "processing" as const,
        columnMappings: {},
        columnCount: 32,
        rowCount: seedToolDataset.length + 12,
        isActive: false,
        diffSummary: { note: "Scheduled ingest" },
        metadata: { source: "seed", tag: "preview" },
      },
    ];

    const insertedVersions = await tx
      .insert(toolVersionsTable)
      .values(versions)
      .returning({ id: toolVersionsTable.id });

    if (!insertedVersions.length) {
      throw new Error("Failed to insert tool versions");
    }

    const activeVersionId = insertedVersions[0]?.id;
    const historicalVersionId = insertedVersions[1]?.id ?? activeVersionId;

    const toolValues = seedToolDataset.map((tool, index) => {
      const publishedAt = new Date(now.getTime() - index * 12 * HOURS);
      const baseMetadata = tool.metadata ?? {};

      return {
        slug: tool.slug,
        name: tool.name,
        vendor: tool.vendor,
        category: tool.category,
        summary: tool.summary,
        website: tool.website,
        status: tool.status ?? "published",
        highlights: tool.highlights,
        regions: tool.regions,
        capabilities: tool.capabilities ?? {},
        comparisonData: tool.comparisonData ?? {},
        rawData: {
          seedSource: SEED_VERSION_TAG,
          capturedAt: publishedAt.toISOString(),
        },
        metadata: {
          ...baseMetadata,
          stats: tool.stats,
        },
        featureScore: tool.featureScore ?? {},
        isFeatured: tool.isFeatured ?? false,
        publishedAt,
        versionId: index % 4 === 0 ? historicalVersionId : activeVersionId,
      };
    });

    const insertedTools = await tx.insert(toolsTable).values(toolValues).returning({
      id: toolsTable.id,
      slug: toolsTable.slug,
      name: toolsTable.name,
    });

    await tx
      .insert(reportMetadataTable)
      .values(
        insertedTools.map((inserted, index) => {
          const template = seedToolDataset[index]!;
          const publishedAt = new Date(now.getTime() - index * 24 * HOURS);

          return {
            title: `${template.name} Deep Dive`,
            ingress: template.report.ingress,
            keyFindings: template.report.keyFindings,
            pdfUrl: template.report.pdfUrl ?? null,
            isPublished: true,
            previewData: {
              author: template.report.author ?? "Traceability Research",
              publishedAt: publishedAt.toISOString(),
              toolSlug: inserted.slug,
              stats: template.stats,
            },
          };
        }),
      )
      .execute();
  });

  console.log(`Seed complete · inserted ${seedToolDataset.length} tools`);
}

runSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
