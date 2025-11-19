import { type ToolStatus } from "@/server/data/types";

type ToolStatusLiteral = ToolStatus;

export const mockToolDataset = [
  {
    slug: "impact-os",
    name: "Impact OS",
    vendor: "Peak Tools",
    summary:
      "Plattform för CSRD och klimatdata med automatiska gap-analyser och stakeholder-rapportering.",
    category: "Platform",
    website: "https://example.com/impact-os",
    highlights: [
      "Automatiserad CSRD-analys",
      "Klimatdata-pipelines",
      "API för leverantörer",
    ],
    regions: ["EU", "Nordics"],
    capabilities: {
      standards: ["CSRD", "GRI"],
      automations: ["data_ingestion", "ai_summary"],
    },
    comparisonData: {
      priceTier: "enterprise",
      implementation: "6 veckor",
    },
    rawData: {
      sourceRow: 12,
    },
    metadata: {
      importLabel: "initial",
    },
    featureScore: {
      ai: 9.2,
      integrations: 8.5,
    },
    status: "published" as ToolStatusLiteral,
    isFeatured: true,
  },
  {
    slug: "carbon-sense",
    name: "Carbon Sense",
    vendor: "North Labs",
    summary:
      "Carbon accounting med direktintegrationer och färdiga dashboards för ledningsrapporter.",
    category: "Carbon",
    website: "https://example.com/carbon-sense",
    highlights: ["Scope 1-3", "Realtime dashboards"],
    regions: ["Global"],
    capabilities: {
      standards: ["SBTi"],
      insights: ["benchmarking"],
    },
    comparisonData: {
      priceTier: "scaleup",
    },
    rawData: {
      sourceRow: 37,
    },
    metadata: {
      importLabel: "initial",
    },
    featureScore: {
      automation: 8,
    },
    status: "published" as ToolStatusLiteral,
    isFeatured: false,
  },
  {
    slug: "supply-graph",
    name: "Supply Graph",
    vendor: "Tracegrid",
    summary: "Leverantörsspårning och riskanalys med interaktiv kartvy och datadelning.",
    category: "Supply Chain",
    website: "https://example.com/supply-graph",
    highlights: ["Riskanalys", "Kartvisualisering"],
    regions: ["EU", "APAC"],
    capabilities: {
      automations: ["supplier_portal"],
    },
    comparisonData: {
      priceTier: "enterprise",
    },
    rawData: {
      sourceRow: 52,
    },
    metadata: {
      importLabel: "initial",
    },
    featureScore: {
      coverage: 8.3,
    },
    status: "draft" as ToolStatusLiteral,
    isFeatured: false,
  },
] as const;

export const mockReportMetadata = {
  title: "Årets jämförelse av traceability-verktyg",
  ingress:
    "Sammanfattning av 50+ verktyg med fokus på CSRD, klimatdata och leverantörsspårning.",
  keyFindings: [
    "AI-sammanfattningar ger tydligare beslutsunderlag",
    "Versionering av Excel-importer är kritiskt för datakvalitet",
    "Integrationsdjup varierar kraftigt mellan kategorier",
  ],
  pdfUrl: "https://example.com/report.pdf",
  isPublished: true,
};
