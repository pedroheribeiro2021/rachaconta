import { test, expect } from "@playwright/test";

test("should re-enter the room via the invite link without duplicating the participant", async ({
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

  const code = page.url().split("/room/")[1];

  await expect(page.getByText("1 participantes")).toBeVisible();

  await page.goto(`/join/${code}`);

  await page.waitForURL(new RegExp(`/room/${code}$`));

  await expect(
    page.getByRole("heading", { name: "Entrar na mesa" }),
  ).not.toBeVisible();

  await expect(page.getByText("1 participantes")).toBeVisible();
});
