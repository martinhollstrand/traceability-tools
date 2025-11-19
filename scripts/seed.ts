import { db } from "../src/server/db";
import {
  toolsTable,
  toolVersionsTable,
  reportMetadataTable,
} from "../src/server/db/schema";

async function runSeed() {
  const now = new Date();

  // Clear existing data
  await db.delete(toolVersionsTable).execute();
  await db.delete(reportMetadataTable).execute();
  await db.delete(toolsTable).execute();

  // Insert tool versions first (they're referenced by tools)
  const versions = [
    {
      label: "v1.0 - Initial Import",
      status: "ready" as const,
      columnMappings: {},
      columnCount: 10,
      rowCount: 100,
      isActive: true,
      diffSummary: {},
      metadata: { source: "seed" },
    },
    {
      label: "v1.0 - Initial Import",
      status: "ready" as const,
      columnMappings: {},
      columnCount: 8,
      rowCount: 75,
      isActive: false,
      diffSummary: {},
      metadata: { source: "seed" },
    },
  ];

  const insertedVersions = await db
    .insert(toolVersionsTable)
    .values(versions)
    .returning({ id: toolVersionsTable.id });

  if (insertedVersions.length < 2) {
    throw new Error("Failed to insert tool versions");
  }

  // Insert tools
  const sampleTools = [
    {
      slug: "tracepilot",
      name: "TracePilot",
      vendor: "TracePilot Inc.",
      category: "Supply Chain",
      summary: "AI-assisted mapping and due diligence workflows for mid-market brands.",
      website: "https://tracepilot.example.com",
      status: "published" as const,
      highlights: ["Supplier Network", "AI Copilot", "Reporting"],
      regions: ["EU", "US"],
      capabilities: {},
      comparisonData: {},
      rawData: {},
      metadata: { certifications: ["GRI", "ISO14001"] },
      featureScore: {},
      isFeatured: true,
      versionId: insertedVersions[0]!.id,
    },
    {
      slug: "sustainledger",
      name: "SustainLedger",
      vendor: "Ledger Labs",
      category: "ESG",
      summary:
        "Unified ESG data warehouse with automated disclosures and assurance tooling.",
      website: "https://sustainledger.example.com",
      status: "published" as const,
      highlights: ["Carbon Accounting", "Reporting", "Workflow Automation"],
      regions: ["EU"],
      capabilities: {},
      comparisonData: {},
      rawData: {},
      metadata: { integrations: 28, pricing: "custom" },
      featureScore: {},
      isFeatured: false,
      versionId: insertedVersions[1]!.id,
    },
  ];

  const insertedTools = await db
    .insert(toolsTable)
    .values(sampleTools)
    .returning({ id: toolsTable.id });

  // Insert report metadata
  await db
    .insert(reportMetadataTable)
    .values(
      insertedTools.map((tool, index) => ({
        title: `${sampleTools[index]?.name} Overview`,
        ingress: `Overview of ${sampleTools[index]?.name}`,
        keyFindings: [
          `Primary Use Case: ${sampleTools[index]?.category}`,
          `Vendor: ${sampleTools[index]?.vendor}`,
        ],
        pdfUrl: null,
        isPublished: true,
        previewData: {
          author: "Traceability Research",
          publishedAt: now.toISOString(),
        },
      })),
    )
    .execute();

  console.log("Seed complete");
}

runSeed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
