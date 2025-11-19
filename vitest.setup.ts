import { vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  logError: vi.fn(),
}));

vi.mock("server-only", () => ({}));
