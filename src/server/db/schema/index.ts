// Re-export all schema tables from separate files
export { toolsTable as tools, toolsTable } from "./tools";
export { toolVersionsTable as toolVersions, toolVersionsTable } from "./tool-versions";
export {
  reportMetadataTable as reportMetadata,
  reportMetadataTable,
} from "./report-metadata";
export { adminUsersTable as adminUsers, adminUsersTable } from "./admin-users";
export {
  toolEmbeddingsTable as toolEmbeddings,
  toolEmbeddingsTable,
} from "./tool-embeddings";
export {
  surveyQuestionsTable as surveyQuestions,
  surveyQuestionsTable,
} from "./survey-questions";
export {
  landingSettingsTable as landingSettings,
  landingSettingsTable,
} from "./landing-settings";

// Re-export relations
export * from "./relations";
