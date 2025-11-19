import { nanoid } from "nanoid";
import { db } from "../src/server/db";
import { tools, toolVersions, reportMetadata } from "../src/server/db/schema";

async function runSeed() {
  const now = new Date().toISOString();
  const sampleTools = [
    {
      id: nanoid(),
      slug: "tracepilot",
      name: "TracePilot",
      vendor: "TracePilot Inc.",
      category: "Supply Chain",
      summary: "AI-assisted mapping and due diligence workflows for mid-market brands.",
      website: "https://tracepilot.example.com",
      logoUrl: "https://placehold.co/96x96",
      features: ["Supplier Network", "AI Copilot", "Reporting"],
      stats: { customers: 140, coverage: 0.72, contracts: 85 },
      metadata: { regions: ["EU", "US"], certifications: ["GRI", "ISO14001"] },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      slug: "sustainledger",
      name: "SustainLedger",
      vendor: "Ledger Labs",
      category: "ESG",
      summary:
        "Unified ESG data warehouse with automated disclosures and assurance tooling.",
      website: "https://sustainledger.example.com",
      logoUrl: "https://placehold.co/96x96",
      features: ["Carbon Accounting", "Reporting", "Workflow Automation"],
      stats: { customers: 65, coverage: 0.54, contracts: 42 },
      metadata: { integrations: 28, pricing: "custom" },
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.delete(toolVersions).execute();
  await db.delete(reportMetadata).execute();
  await db.delete(tools).execute();

  await db.insert(tools).values(sampleTools).execute();

  const versions = sampleTools.map((tool, index) => ({
    id: nanoid(),
    toolId: tool.id,
    versionTag: `v${index + 1}.0`,
    diffSummary: "Initial import",
    snapshot: tool,
    columnMapping: {},
  }));

  await db.insert(toolVersions).values(versions).execute();

  await db
    .insert(reportMetadata)
    .values(
      sampleTools.map((tool) => ({
        id: nanoid(),
        toolId: tool.id,
        title: `${tool.name} Overview`,
        pdfUrl: "",
        highlights: [
          { label: "Primary Use Case", detail: tool.category },
          { label: "Customers", detail: tool.stats.customers.toString() },
        ],
        metadata: {
          author: "Traceability Research",
          publishedAt: now,
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
