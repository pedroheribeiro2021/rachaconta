import { test, expect } from "@playwright/test";

test("should open join page from invite link for a new participant", async ({
  page,
  browser,
}) => {
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

  // Uses a fresh browser context (separate anonymous session) so this
  // behaves like a different person opening the invite link, not the
  // host revisiting their own link.
  const guestContext = await browser.newContext();

  const guestPage = await guestContext.newPage();

  await guestPage.goto(`/join/${code}`);

  await expect(
    guestPage.getByRole("button", {
      name: /entrar/i,
    }),
  ).toBeVisible();

  await guestPage.getByPlaceholder("Seu apelido").fill("João");

  await guestPage.getByRole("button", { name: /entrar/i }).click();

  await guestPage.waitForURL(new RegExp(`/room/${code}$`));

  await expect(guestPage.getByText("2 participantes")).toBeVisible();

  await guestContext.close();
});
