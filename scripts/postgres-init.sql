-- Postgres init script (runs only on first container init with an empty data volume)
-- Keeps local Docker DB aligned with expected extensions.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

