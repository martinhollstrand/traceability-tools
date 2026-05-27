/**
 * Sentinel used in the public `/tools` filter URL/state to represent the
 * bundled "Other" category — i.e. every visible category that is only used by
 * a single published tool. Resolved server-side by `listTools`.
 *
 * Lives in a client-safe module so both client components (FilterBar) and
 * server-only modules (`tool-categories.ts`, `tools.ts`) can share it.
 */
export const OTHER_CATEGORY_FILTER_VALUE = "__other__";
