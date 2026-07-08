import type { Locator, Page } from "@playwright/test";

import {
  claimsTable,
  currencyTab,
  gotoCurrencies,
  openPopover,
  rateDeleteButton,
  ratesTable,
  SEED,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

// The small seed builds one USD rate (2024-01-15) and one USD claim
// (2024-02-20, a transaction with no rate) — see helpers/seed.ts seedSmall.

function tableDataRows(page: Page, table: Locator): Locator {
  return table
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader") })
    .filter({ hasNotText: "No records" });
}

test.beforeAll(async ({ browser, workerServer }) => {
  const context = await browser.newContext({ baseURL: workerServer.baseURL });
  const page = await context.newPage();
  try {
    await page.goto("/transactions", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
  } catch {
    // best-effort warmup
  } finally {
    await context.close();
  }
});

test.beforeEach(async ({ workerServer }) => {
  await workerServer.resetDb("small");
});

test.afterEach(async ({ workerServer }) => {
  try {
    await workerServer.resetDb("large");
  } catch {
    // best-effort cleanup
  }
});

test("create a rate from a claim moves the row to the rates table", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await expect(currencyTab(page, "USD")).toBeVisible();
  await currencyTab(page, "USD").click();

  const claims = claimsTable(page);
  const rates = ratesTable(page);
  await expect(claims).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => tableDataRows(page, claims).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdClaims);
  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdRates);

  // Enter a positive rate in the claim row's numeric input and submit.
  const input = claims.locator('input[type="number"]').first();
  await expect(input).toBeVisible();
  await input.fill("0.8");
  await input.press("Enter");

  // The claim is consumed and the rates table gains a row.
  await expect
    .poll(() => tableDataRows(page, claims).count(), { timeout: 15_000 })
    .toBe(0);
  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdRates + 1);
});

test("an invalid rate triggers an alert and creates nothing", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await expect(currencyTab(page, "USD")).toBeVisible();
  await currencyTab(page, "USD").click();

  const claims = claimsTable(page);
  const rates = ratesTable(page);
  await expect
    .poll(() => tableDataRows(page, claims).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdClaims);
  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdRates);

  // The app validates with a native alert(); accept it and assert its message.
  let alertMessage = "";
  page.on("dialog", (dialog) => {
    alertMessage = dialog.message();
    return dialog.accept();
  });

  const input = claims.locator('input[type="number"]').first();
  await expect(input).toBeVisible();
  await input.fill("0");
  await input.press("Enter");

  await expect
    .poll(() => alertMessage, { timeout: 15_000 })
    .toContain("valid number");
  // Nothing was created: claim stays, rates unchanged.
  await expect
    .poll(() => tableDataRows(page, claims).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdClaims);
  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdRates);
});

test("delete a rate with confirmation removes the row", async ({ page }) => {
  await gotoCurrencies(page);
  await expect(currencyTab(page, "USD")).toBeVisible();
  await currencyTab(page, "USD").click();

  const rates = ratesTable(page);
  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(SEED.small.usdRates);

  const delBtn = rateDeleteButton(rates).first();
  await expect(delBtn).toBeVisible();
  await delBtn.click();
  const confirm = openPopover(page);
  await expect(confirm).toBeVisible({ timeout: 15_000 });
  const yesBtn = confirm.getByRole("button", { name: "Yes, remove" });
  await expect(yesBtn).toBeVisible();
  await yesBtn.click();

  await expect
    .poll(() => tableDataRows(page, rates).count(), { timeout: 15_000 })
    .toBe(0);
});
