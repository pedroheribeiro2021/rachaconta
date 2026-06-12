import { test, expect } from "@playwright/test";

test("home should load", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("RachaConta")).toBeVisible();
  await expect(page.getByPlaceholder("Seu apelido")).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar Mesa" })).toBeVisible();
});

test("should require nickname before creating room", async ({ page }) => {
  await page.goto("/");

  page.on("dialog", (dialog) => dialog.accept());

  await page.getByRole("button", { name: "Criar Mesa" }).click();

  await expect(page.getByText("RachaConta")).toBeVisible();
});

test("should create room and redirect", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Seu apelido").fill("Pedro");

  await page.getByRole("button", { name: "Criar Mesa" }).click();

  await page.waitForURL(/\/room\/.+/);

  await expect(page).toHaveURL(/\/room\/.+/);
});
