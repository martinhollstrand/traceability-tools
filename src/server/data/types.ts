export type ToolStatus = "draft" | "published" | "archived";

export type ToolListItem = {
  id: string;
  slug: string;
  name: string;
  vendor: string | null;
  summary: string | null;
  category: string | null;
  highlights: string[];
  regions: string[];
  status: ToolStatus;
  website: string | null;
  isFeatured: boolean;
  featureScore: Record<string, number>;
  versionLabel?: string | null;
};

export type ToolComparisonRow = ToolListItem & {
  capabilities: Record<string, unknown>;
  comparisonData: Record<string, unknown>;
};

export type ReportMetadataPayload = {
  title: string;
  ingress: string | null;
  keyFindings: string[];
  pdfUrl: string | null;
  isPublished: boolean;
  updatedAt?: string;
};
