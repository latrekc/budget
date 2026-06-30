import { transactionRows, transactionsTable } from "./helpers/selectors";
import { expect, test } from "./helpers/server";

const RATE_NOT_DEFINED = "Exchange rate is not defined";

test("a GBP row shows only its native amount", async ({ page }) => {
  await page.goto("/transactions?currencies=GBP&months=2026-01");
  await expect(transactionRows(page).first()).toBeVisible();
  await expect(transactionsTable(page).getByText(RATE_NOT_DEFINED)).toHaveCount(
    0,
  );
  await expect(transactionsTable(page)).toContainText("£");
});

test("a non-GBP row with a seeded rate shows the converted GBP amount", async ({
  page,
}) => {
  await page.goto("/transactions?currencies=USD&months=2026-01");
  const row = transactionRows(page).first();
  await expect(row).toBeVisible();
  await expect(row).not.toContainText(RATE_NOT_DEFINED);
  // Native USD ($) plus the converted GBP (£) value.
  await expect(row).toContainText("$");
  await expect(row).toContainText("£");
});

test("a non-GBP row on a rate-gap date shows the missing-rate warning", async ({
  page,
}) => {
  await page.goto("/transactions?currencies=USD&months=2019-01");
  const row = transactionRows(page).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText(RATE_NOT_DEFINED);
});
