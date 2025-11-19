import { test, expect } from "@playwright/test";

test("landing page renders featured section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /curated shortlist/i })).toBeVisible();
});

test("tools directory lists table", async ({ page }) => {
  await page.goto("/tools");
  await expect(
    page.getByRole("heading", { name: /traceability & ESG tools/i }),
  ).toBeVisible();
});
