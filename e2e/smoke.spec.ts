import { test, expect } from "@playwright/test";

test("homepage renders hero content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("hållbarhets");
  await expect(page.getByRole("link", { name: "Se alla verktyg" })).toBeVisible();
});
