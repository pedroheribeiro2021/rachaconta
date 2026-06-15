import { test, expect } from "@playwright/test";

test("should create room and manage items", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Seu apelido").fill("Pedro");

  await page.getByRole("button", { name: "Criar Mesa" }).click();

  await page.waitForURL(/\/room\/.+/);

  await expect(
    page.getByRole("heading", {
      name: "Participantes",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Itens",
    }),
  ).toBeVisible();

  await page.getByTestId("item-name-input").fill("Pizza");

  await page.getByTestId("item-price-input").fill("100");

  await page.getByTestId("add-item-button").click();

  await expect(page.getByText("Pizza")).toBeVisible();

  await page.locator('[data-testid^="edit-item-"]').first().click();

  const modalInputs = page.locator(".fixed input");

  await modalInputs.nth(0).fill("Pizza Grande");

  await page.getByTestId("save-item-button").click();

  await expect(page.getByText("Pizza Grande")).toBeVisible();

  page.on("dialog", (dialog) => dialog.accept());

  await page.locator('[data-testid^="delete-item-"]').first().click();

  await expect(page.getByText("Pizza Grande")).toHaveCount(0);
});
