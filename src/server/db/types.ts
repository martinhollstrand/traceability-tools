import { adminUsersTable } from "@/server/db/schema/admin-users";
import { reportMetadataTable } from "@/server/db/schema/report-metadata";
import { toolVersionsTable } from "@/server/db/schema/tool-versions";
import { toolsTable } from "@/server/db/schema/tools";
import { toolEmbeddingsTable } from "@/server/db/schema/tool-embeddings";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";

export type Tool = InferSelectModel<typeof toolsTable>;
export type NewTool = InferInsertModel<typeof toolsTable>;

export type ToolVersion = InferSelectModel<typeof toolVersionsTable>;
export type NewToolVersion = InferInsertModel<typeof toolVersionsTable>;

export type AdminUser = InferSelectModel<typeof adminUsersTable>;
export type NewAdminUser = InferInsertModel<typeof adminUsersTable>;

export type ReportMetadata = InferSelectModel<typeof reportMetadataTable>;
export type NewReportMetadata = InferInsertModel<typeof reportMetadataTable>;

export type ToolEmbedding = InferSelectModel<typeof toolEmbeddingsTable>;
export type NewToolEmbedding = InferInsertModel<typeof toolEmbeddingsTable>;
