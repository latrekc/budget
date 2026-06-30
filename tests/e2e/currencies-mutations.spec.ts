import type { Locator, Page } from "@playwright/test";

import {
  claimsTable,
  currencyTab,
  gotoCurrencies,
  openPopover,
  rateDeleteButton,
  ratesTable,
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

test.beforeEach(async ({ workerServer }) => {
  await workerServer.resetDb("small");
});

// Restore the golden snapshot so read-only specs that later share this worker
// still see the large dataset (workers are reused across spec files).
test.afterEach(async ({ workerServer }) => {
  await workerServer.resetDb("large");
});

test("create a rate from a claim moves the row to the rates table", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await currencyTab(page, "USD").click();

  const claims = claimsTable(page);
  const rates = ratesTable(page);
  await expect(tableDataRows(page, claims)).toHaveCount(1);
  await expect(tableDataRows(page, rates)).toHaveCount(1);

  // Enter a positive rate in the claim row's numeric input and submit.
  const input = claims.locator('input[type="number"]').first();
  await input.fill("0.8");
  await input.press("Enter");

  // The claim is consumed and the rates table gains a row.
  await expect(tableDataRows(page, claims)).toHaveCount(0);
  await expect(tableDataRows(page, rates)).toHaveCount(2);
});

test("an invalid rate triggers an alert and creates nothing", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await currencyTab(page, "USD").click();

  const claims = claimsTable(page);
  const rates = ratesTable(page);
  await expect(tableDataRows(page, claims)).toHaveCount(1);
  await expect(tableDataRows(page, rates)).toHaveCount(1);

  // The app validates with a native alert(); accept it and assert its message.
  let alertMessage = "";
  page.on("dialog", (dialog) => {
    alertMessage = dialog.message();
    return dialog.accept();
  });

  const input = claims.locator('input[type="number"]').first();
  await input.fill("0");
  await input.press("Enter");

  await expect.poll(() => alertMessage).toContain("valid number");
  // Nothing was created: claim stays, rates unchanged.
  await expect(tableDataRows(page, claims)).toHaveCount(1);
  await expect(tableDataRows(page, rates)).toHaveCount(1);
});

test("delete a rate with confirmation removes the row", async ({ page }) => {
  await gotoCurrencies(page);
  await currencyTab(page, "USD").click();

  const rates = ratesTable(page);
  await expect(tableDataRows(page, rates)).toHaveCount(1);

  await rateDeleteButton(rates).first().click();
  const confirm = openPopover(page);
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Yes, remove" }).click();

  await expect(tableDataRows(page, rates)).toHaveCount(0);
});
