import { test, expect } from "@playwright/test";

test("should open join page from invite link", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Seu apelido").fill("Pedro");

  await page
    .getByRole("button", {
      name: "Criar Mesa",
    })
    .click();

  await page.waitForURL(/\/room\/.+/);

  const url = page.url();

  const code = url.split("/room/")[1];

  await page.goto(`/join/${code}`);

  await expect(
    page.getByRole("button", {
      name: /entrar/i,
    }),
  ).toBeVisible();
});
