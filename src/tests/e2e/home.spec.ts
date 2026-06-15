import { test, expect } from "@playwright/test";

test("should create room, assign item and calculate totals", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByPlaceholder("Seu apelido").fill("Pedro");

  await page
    .getByRole("button", {
      name: "Criar Mesa",
    })
    .click();

  await page.waitForURL(/\/room\/.+/);

  await page.getByTestId("item-name-input").fill("Pizza");

  await page.getByTestId("item-price-input").fill("100");

  await page.getByTestId("add-item-button").click();

  await expect(page.getByText("Pizza")).toBeVisible();

  await page.getByRole("checkbox").first().click();

  await expect(page.getByText("Subtotal: R$ 100.00")).toBeVisible();

  await expect(page.getByText("Taxa: R$ 10.00")).toBeVisible();

  await expect(page.getByText("Total: R$ 110.00")).toBeVisible();

  await expect(page.getByTestId("room-total")).toContainText("R$ 110.00");
});
