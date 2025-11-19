export const SITE_NAME = "Traceability Tools";
export const DEFAULT_META = {
  title: SITE_NAME,
  description:
    "Compare sustainability and traceability tooling, understand feature gaps, and evaluate implementation readiness.",
};

export const COMPARE_LIMIT = 12;

export const FEATURE_TAGS = [
  "Supplier Network",
  "Carbon Accounting",
  "Certification",
  "Workflow Automation",
  "AI Copilot",
  "Reporting",
] as const;

export const CATEGORY_FILTERS = [
  "Due Diligence",
  "Supply Chain",
  "ESG",
  "Compliance",
  "Data Platform",
] as const;

export const REPORT_SECTIONS = [
  "Highlights",
  "Implementation Considerations",
  "Data Requirements",
  "Licensing",
] as const;

export const CACHE_TAGS = {
  tools: "tools:data",
  reports: "reports:data",
  comparison: (ids: string[]) => `compare:${ids.sort().join(":")}`,
};
