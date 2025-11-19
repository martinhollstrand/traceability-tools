<!-- a131d716-5312-4efe-9cfc-221efa0013d7 6aa545a9-f495-420e-8bfc-d9118fea215b -->

# Implementation Plan for traceabilitytools.com

## Architecture & Tooling

- Initialize Next.js 15 App Router project under `app/`, enforce TypeScript, ESLint, Prettier, Husky/Lefthook, and playwright/vitest scaffolding.
- Configure Tailwind with shadcn/ui generator; establish design tokens, typography scale, and reusable primitives in `src/components/ui`.
- Set up environment management (`.env.local`, `.env.example`) for database URL, BetterAuth secrets, Vercel AI key, storage buckets.
- Configure Drizzle with Neon PostgreSQL (`drizzle.config.ts`, `src/server/db`). Build migration scripts and CI check that `drizzle-kit generate` has been run.
- Add shared utilities in `src/lib` (schema validation via Zod, formatting, constants, logger with Pino/Next logger).

## Data Model & Backend APIs

- Implement Drizzle schema files in `src/server/db/schema` for `tools`, `tool_versions`, `report_metadata`, `admin_users`, optional `tool_embeddings`.
- Create seed scripts and sample migrations for initial dataset import (`scripts/seed.ts`).
- Expose data loaders via server-only modules in `src/server/data` (list tools, filter metadata, comparison query).
- Build server actions and REST endpoints under `src/app/api` for tool CRUD, Excel ingestion, AI summary, auth session.
- Add caching strategy with Next.js Route Handlers + `revalidateTag` for listings and comparisons.

## Public Experience (Milestone M1)

- Compose layout scaffolding in `src/app/(public)/layout.tsx` with header/footer, navigation, sticky compare bar provider.
- Implement `page.tsx` for landing (hero, stats, how-it-works) using streaming server components and awaited `params`/`searchParams` per Next.js 15.
- Build `tools/page.tsx` for searchable/filterable table with server-side data fetch, client-side filter state, and `ToolCard`/`ToolRow` components.
- Implement comparison route `compare/page.tsx` showing comparison grid and summary placeholder; add shared `useCompareStore` (zustand or server actions + cookies) for selections.
- Create report page `report/page.tsx` rendering metadata, key findings, PDF link viewer.
- Ensure responsive design tokens, accessibility audits, SEO metadata (OpenGraph, JSON-LD).

## Admin Experience (Milestone M2)

- Secure admin routes under `src/app/(admin)` with BetterAuth middleware and layout containing sidebar/topbar.
- Build dashboard page summarizing tool counts, last import, call-to-action for Excel upload.
- Implement Data & Excel management view with file upload dropzone (tus/resumable or standard), preview grid, import confirmation using server actions.
- Add column mapping wizard component leveraging discovered Excel headers and stored user mappings in `tool_versions` JSON column.
- Provide inline data editor for individual tool records with optimistic updates/backoff and audit trail capture.
- Develop report settings editor with form components, autosave or explicit save, and PDF upload to storage (Vercel Blob/S3) tracked in `report_metadata`.

## Excel Import Pipeline

- Implement upload handler in `src/app/api/excel/upload/route.ts` storing temp file (edge-friendly approach) and queuing processing job.
- Create parser utility in `src/server/excel/parser.ts` using SheetJS to convert to JSON, normalize headers, validate via Zod.
- Map dynamic columns to `tools` schema (flexible JSONB columns or associating metadata table) and insert via Drizzle batch operations.
- Record new version entry in `tool_versions` with diff summary and column snapshot.
- Add notification + UI feedback for success/errors, including column change warnings.

## AI Comparison Summary (Milestone M3)

- Integrate Vercel AI SDK in `src/server/ai/summary.ts` to call GPT-5.1-mini with curated prompt and guardrails.
- Expose server action/route for requesting comparison summary, with caching by selected tool IDs and fallbacks for rate limits.
- Surface summary panel in comparison page with loading states and error handling.
- Add analytics event logging for prompt usage and latency.

## Versioning & Advanced Features (Milestone M4)

- Implement versions list page in admin showing metadata, diff preview stub, activation control with server action to mark active version.
- Provide ability to restore older versions by re-running stored snapshot into `tools` table.
- Prepare scaffolding for future diff visualization (store computed diffs in JSON for later UI).

## Quality, Observability & Deployment

- Write end-to-end tests (Playwright) for critical flows: public browse, comparison, admin import, data edit.
- Add unit/integration tests (Vitest) for data loaders, Excel parsing, AI prompt builder.
- Configure logging/monitoring (Vercel Analytics, Sentry) and feature flags for AI and import features.
- Set up CI/CD workflows: lint, typecheck, test, drizzle diff check, deploy previews.
- Document developer processes in `README.md` and ensure `docs/initial-specification.md` stays synced via ADRs.

### To-dos

- [x] Bootstrap Next.js 15 app, configs, shared tooling
- [ ] Define Drizzle schema, migrations, seed utilities
- [ ] Implement public pages and comparison flow
- [ ] Build admin auth, data mgmt, excel import
- [ ] Integrate AI summary and version history
- [ ] Add tests, monitoring, CI/CD hook-ups
