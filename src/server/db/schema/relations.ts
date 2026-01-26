import { relations } from "drizzle-orm";
import { toolsTable } from "@/server/db/schema/tools";
import { toolVersionsTable } from "@/server/db/schema/tool-versions";
import { adminUsersTable } from "@/server/db/schema/admin-users";
import { toolEmbeddingsTable } from "@/server/db/schema/tool-embeddings";
import { surveyQuestionsTable } from "@/server/db/schema/survey-questions";

export const toolsRelations = relations(toolsTable, ({ one, many }) => ({
  version: one(toolVersionsTable, {
    fields: [toolsTable.versionId],
    references: [toolVersionsTable.id],
  }),
  embeddings: many(toolEmbeddingsTable),
}));

export const toolVersionsRelations = relations(toolVersionsTable, ({ one, many }) => ({
  uploader: one(adminUsersTable, {
    fields: [toolVersionsTable.uploadedBy],
    references: [adminUsersTable.id],
  }),
  tools: many(toolsTable),
  surveyQuestions: many(surveyQuestionsTable),
}));

export const toolEmbeddingsRelations = relations(toolEmbeddingsTable, ({ one }) => ({
  tool: one(toolsTable, {
    fields: [toolEmbeddingsTable.toolId],
    references: [toolsTable.id],
  }),
}));

export const surveyQuestionsRelations = relations(surveyQuestionsTable, ({ one }) => ({
  version: one(toolVersionsTable, {
    fields: [surveyQuestionsTable.versionId],
    references: [toolVersionsTable.id],
  }),
}));
