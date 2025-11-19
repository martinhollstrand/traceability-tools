## Traceabilitytools.com

Explorer, comparison, and admin console for sustainability tooling across supply-chain, ESG, and traceability vendors.

### Stack

- Next.js App Router (React 19), TypeScript, Tailwind 4, shadcn-derived UI primitives
- Drizzle ORM + Neon/Postgres, BetterAuth for admin gating
- Vercel AI SDK for comparison summaries, SheetJS for Excel ingestion
- Vitest + Testing Library for unit tests, Playwright for E2E
- Husky + Lefthook + lint-staged enforce lint/typecheck before pushes

### Getting started

```bash
npm install
cp .env.example .env.local # fill in credentials
npm run dev
```

Key scripts:

- `npm run lint`, `npm run typecheck`, `npm run test`
- `npm run test:e2e` (Playwright)
- `npm run drizzle:generate` (sync schema), `npm run drizzle:studio` (inspector)
- `npm run check` runs typecheck+lint+tests (pre-push)

### Database & data

- Configure `DATABASE_URL` (Neon or local Postgres)
- Drizzle schema lives in `src/server/db/schema`
- Run seeds: `npx tsx scripts/seed.ts`
- Generated SQL migrations are stored under `drizzle/`

### Excel ingestion & AI

- Upload via Admin → Data ingestion (`/(admin)/imports`) posting to `POST /api/excel/upload`
- Parser (`src/server/excel/parser.ts`) normalizes headers and validates with Zod
- AI summary endpoint `/api/ai/summary` wraps Vercel AI SDK (`src/server/ai/summary.ts`)

### Testing

- Vitest config + setup is under `vitest.config.ts` (see `src/test`)
- Playwright spec lives in `tests/e2e/public.spec.ts`
- `npm run test:watch` for TDD, `npm run test:e2e` for smoke

### Project structure

```
src/
  app/                # App Router routes (public + admin)
  components/         # UI primitives, layouts, feature components
  lib/                # constants, env, utils
  server/             # db, data loaders, auth, AI, Excel parsing
  store/              # client state (compare selections)
scripts/              # seed + automation
drizzle/              # SQL migrations
docs/                 # Specifications & ADRs
```

### Quality gates

Husky and Lefthook run `npm run lint-staged` on commit and `npm run check` before push. Run `npm run check` locally before opening a PR. Use `npm run format` to enforce Prettier + Tailwind ordering. Playwright/Vitest provide regression coverage for critical paths. All new routes follow Next.js 15 `await params/searchParams` expectations.
