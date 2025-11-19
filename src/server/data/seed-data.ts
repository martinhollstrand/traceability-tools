import type { ToolStatus } from "./types";

type SeedToolStats = {
  customers: number;
  coverage: number;
  contracts: number;
};

type SeedToolReport = {
  ingress: string;
  keyFindings: string[];
  pdfUrl?: string | null;
  author?: string;
};

export type SeedToolDefinition = {
  slug: string;
  name: string;
  vendor: string;
  summary: string;
  category: string;
  website: string;
  status?: ToolStatus;
  highlights: string[];
  regions: string[];
  capabilities?: Record<string, unknown>;
  comparisonData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  featureScore?: Record<string, number>;
  isFeatured?: boolean;
  stats: SeedToolStats;
  report: SeedToolReport;
};

export const seedToolDataset: SeedToolDefinition[] = [
  {
    slug: "tracepilot",
    name: "TracePilot",
    vendor: "TracePilot Inc.",
    summary: "AI-assisted mapping and risk workflows built for mid-market supply teams.",
    category: "Supply Chain",
    website: "https://tracepilot.example.com",
    status: "published",
    highlights: ["Supplier Network", "AI Copilot", "Risk Alerts"],
    regions: ["EU", "US"],
    capabilities: {
      ai: ["Risk scoring", "Exception handling"],
      connectors: 68,
      collaboration: ["Shared workspaces"],
      compliance: ["CSRD", "CBAM"],
    },
    comparisonData: {
      deployment: "SaaS + Private Cloud",
      security: ["SOC 2 Type II", "ISO 27001"],
      implementationTime: "6 weeks",
      dataResidency: ["EU", "US"],
    },
    metadata: {
      tagline: "The co-pilot for resilient supplier programs.",
      pricingModel: "Usage-based",
      launchYear: 2020,
    },
    featureScore: {
      ai: 9.2,
      coverage: 8.7,
      integrations: 9.1,
    },
    isFeatured: true,
    stats: {
      customers: 185,
      coverage: 0.78,
      contracts: 74,
    },
    report: {
      ingress:
        "TracePilot combines network graph analytics with an AI co-pilot for triaging supplier risk.",
      keyFindings: [
        "Differentiated supplier knowledge graph powering proactive alerts.",
        "Copilot workflows reduce diligence effort by 43% on average.",
        "Rapid time-to-value with ready-made connectors for ERPs and PLM.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "sustainledger",
    name: "SustainLedger",
    vendor: "Ledger Labs",
    summary:
      "Unified ESG data warehouse with automated disclosures and assurance workflows.",
    category: "ESG",
    website: "https://sustainledger.example.com",
    status: "published",
    highlights: ["Carbon Accounting", "Automated Disclosures", "Controls"],
    regions: ["EU", "UK"],
    capabilities: {
      disclosures: ["CSRD", "GRI"],
      automations: ["assurance_ai", "data_quality_rules"],
      integrations: 28,
    },
    comparisonData: {
      deployment: "SaaS",
      security: ["SOC 2 Type I"],
      implementationTime: "8 weeks",
      assurancePartners: 12,
    },
    metadata: {
      tagline: "ESG command center with investor-grade controls.",
      pricingModel: "Enterprise subscription",
      dataRefreshCadence: "Daily",
    },
    featureScore: {
      ai: 8.4,
      coverage: 7.9,
      integrations: 7.2,
    },
    isFeatured: false,
    stats: {
      customers: 96,
      coverage: 0.64,
      contracts: 58,
    },
    report: {
      ingress:
        "SustainLedger centralizes ESG evidence and automates disclosure-ready outputs.",
      keyFindings: [
        "Single data model harmonizes financial, emissions, and supplier data.",
        "Built-in assurance workflows accelerate auditor sign-off.",
        "Integrations roadmap focuses on European regulatory feeds.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "impact-os",
    name: "Impact OS",
    vendor: "Peak Tools",
    summary:
      "CSRD-ready sustainability platform with automated gap analysis and stakeholder dashboards.",
    category: "Platform",
    website: "https://impactos.example.com",
    status: "published",
    highlights: ["Gap Analysis", "Stakeholder Dashboards", "Scenario Planning"],
    regions: ["EU", "Nordics"],
    capabilities: {
      standards: ["CSRD", "GRI"],
      automations: ["gap_analysis", "ai_summary"],
      workspaceModules: ["Materiality", "Stakeholder engagement"],
    },
    comparisonData: {
      deployment: "SaaS",
      implementationTime: "5 weeks",
      languagesSupported: ["English", "Swedish"],
    },
    metadata: {
      tagline: "Purpose-built for CSRD leaders in the Nordics.",
      pricingModel: "Tiered per entity",
    },
    featureScore: {
      ai: 8.9,
      coverage: 8.1,
      integrations: 7.8,
    },
    isFeatured: true,
    stats: {
      customers: 142,
      coverage: 0.69,
      contracts: 61,
    },
    report: {
      ingress:
        "Impact OS delivers CSRD playbooks with localized guidance for Nordic enterprises.",
      keyFindings: [
        "Automated gap assessments surface remediation tasks instantly.",
        "Stakeholder portal keeps board reporting synchronized.",
        "Strong localization but limited integrations beyond ERP connectors.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "carbon-sense",
    name: "Carbon Sense",
    vendor: "North Labs",
    summary:
      "Realtime carbon accounting with pre-built dashboards and scenario planning.",
    category: "Carbon",
    website: "https://carbonsense.example.com",
    status: "published",
    highlights: ["Scope 1-3", "Realtime Dashboards", "Scenario Planning"],
    regions: ["Global"],
    capabilities: {
      standards: ["SBTi"],
      insights: ["benchmarking", "scenario_modeling"],
      connectors: 42,
    },
    comparisonData: {
      deployment: "SaaS",
      mobileApp: true,
      implementationTime: "4 weeks",
    },
    metadata: {
      tagline: "Realtime emissions telemetry for operations teams.",
      pricingModel: "Per facility",
    },
    featureScore: {
      ai: 8.1,
      coverage: 8.4,
      integrations: 8.0,
    },
    isFeatured: false,
    stats: {
      customers: 210,
      coverage: 0.82,
      contracts: 52,
    },
    report: {
      ingress:
        "Carbon Sense pairs sensor feeds with finance data to surface actionable emissions trends.",
      keyFindings: [
        "Automated ingestion reduces manual spreadsheets for facility managers.",
        "Scenario planning ties emission trajectories to financial KPIs.",
        "Needs deeper supplier-level datasets for hard-to-abate categories.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "supply-graph",
    name: "Supply Graph",
    vendor: "Tracegrid",
    summary: "Interactive supply risk maps with collaborative mitigation workflows.",
    category: "Supply Chain",
    website: "https://supplygraph.example.com",
    status: "published",
    highlights: ["Risk Analysis", "Map Visualization", "Collaboration"],
    regions: ["EU", "APAC"],
    capabilities: {
      automations: ["supplier_portal"],
      graphDepth: "Tier-3",
      riskSignals: ["geopolitical", "esg"],
    },
    comparisonData: {
      deployment: "SaaS + Managed Service",
      implementationTime: "10 weeks",
      mappingAccuracy: "92%",
    },
    metadata: {
      tagline: "Visual risk intelligence for extended supply chains.",
      pricingModel: "Platform + managed discovery",
    },
    featureScore: {
      ai: 8.6,
      coverage: 8.9,
      integrations: 7.4,
    },
    isFeatured: false,
    stats: {
      customers: 88,
      coverage: 0.74,
      contracts: 49,
    },
    report: {
      ingress:
        "Supply Graph streamlines supplier discovery with a visual knowledge graph and mitigation workspace.",
      keyFindings: [
        "Combines shipping data and news sentiment for near-real-time alerts.",
        "Managed analyst overlay accelerates coverage of opaque regions.",
        "Advanced collaboration tools require change management for adoption.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "ethic-chain",
    name: "EthicChain",
    vendor: "Conscience Systems",
    summary: "Third-party risk and compliance automation for supplier onboarding.",
    category: "Compliance",
    website: "https://ethicchain.example.com",
    status: "published",
    highlights: ["Automated Audits", "Third-Party Risk", "Policy Engine"],
    regions: ["US", "LATAM"],
    capabilities: {
      automations: ["policy_checks", "license_monitoring"],
      workflows: ["onboarding", "annual_certification"],
      evidenceVault: true,
    },
    comparisonData: {
      deployment: "SaaS",
      policyTemplates: 180,
      integrationPatterns: ["API", "SFTP"],
    },
    metadata: {
      tagline: "Policy automation engine for third-party diligence.",
      pricingModel: "Seat + usage hybrid",
    },
    featureScore: {
      ai: 7.9,
      coverage: 7.1,
      integrations: 8.3,
    },
    isFeatured: false,
    stats: {
      customers: 132,
      coverage: 0.58,
      contracts: 67,
    },
    report: {
      ingress:
        "EthicChain automates supplier onboarding with configurable policy engines and audit trails.",
      keyFindings: [
        "Pre-built policy templates accelerate onboarding compliance.",
        "License monitoring links external registries for continuous assurance.",
        "Workflow builder is flexible but requires initial admin enablement.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "provenance-iq",
    name: "ProvenanceIQ",
    vendor: "Align Labs",
    summary: "Digital product passports and traceability scoring across supplier tiers.",
    category: "Traceability",
    website: "https://provenanceiq.example.com",
    status: "published",
    highlights: ["Digital Passports", "Trace Score", "Supplier Collaboration"],
    regions: ["EU", "US", "APAC"],
    capabilities: {
      passports: ["GS1 EPCIS", "EU DPP"],
      collaboration: ["shared_timeline"],
      analytics: ["traceability_scorecard"],
    },
    comparisonData: {
      deployment: "SaaS",
      implementationTime: "7 weeks",
      passportCoverage: "Tier-4",
    },
    metadata: {
      tagline: "Digital passports without supplier friction.",
      pricingModel: "Per product line",
    },
    featureScore: {
      ai: 8.8,
      coverage: 9.1,
      integrations: 8.5,
    },
    isFeatured: true,
    stats: {
      customers: 164,
      coverage: 0.81,
      contracts: 83,
    },
    report: {
      ingress:
        "ProvenanceIQ anchors digital product passports with collaborative supplier scorecards.",
      keyFindings: [
        "Passport builder meets emerging EU DPP requirements out of the box.",
        "Collaboration timeline reduces supplier response cycles by 35%.",
        "Needs deeper integrations with legacy PLM systems for full automation.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
  {
    slug: "terra-scope",
    name: "TerraScope",
    vendor: "GeoFuture",
    summary:
      "Satellite-informed land use monitoring with automated deforestation alerts.",
    category: "Geospatial",
    website: "https://terrascope.example.com",
    status: "published",
    highlights: ["Satellite Monitoring", "Deforestation Alerts", "Scenario Modeling"],
    regions: ["Global"],
    capabilities: {
      insights: ["ndvi", "climate_risk"],
      dataSources: ["Sentinel-2", "PlanetScope"],
      automations: ["ai_alerts"],
    },
    comparisonData: {
      deployment: "SaaS",
      imageryLatency: "24 hours",
      alerting: ["Slack", "Email", "Webhook"],
    },
    metadata: {
      tagline: "Climate intelligence from orbit for sourcing teams.",
      pricingModel: "Volume-based imagery",
    },
    featureScore: {
      ai: 8.3,
      coverage: 8.8,
      integrations: 7.6,
    },
    isFeatured: false,
    stats: {
      customers: 76,
      coverage: 0.77,
      contracts: 38,
    },
    report: {
      ingress:
        "TerraScope fuses satellite feeds with supply chain rosters to flag land-use risks.",
      keyFindings: [
        "Alerting engine pushes threshold breaches within 24 hours.",
        "Scenario modeling translates climate risk into procurement impact.",
        "Imagery licensing costs can spike for very large geographies.",
      ],
      pdfUrl: null,
      author: "Traceability Research",
    },
  },
];
