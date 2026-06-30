import type { Locator, Page } from "@playwright/test";

import {
  claimsTable,
  currencyTab,
  currencyTabs,
  gotoCurrencies,
  ratesTable,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

const NON_GBP = ["USD", "EUR", "RUB", "HUF", "JPY", "TRY"];
const USD_CLAIMS = 3;

function tableDataRows(page: Page, table: Locator): Locator {
  return table.getByRole("row").filter({ has: page.getByRole("rowheader") });
}

test("tabs render only for currencies that have rates or claims", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await expect(currencyTabs(page)).toBeVisible();
  for (const currency of NON_GBP) {
    await expect(currencyTab(page, currency)).toBeVisible();
  }
  // GBP is the base currency and is never listed.
  await expect(
    currencyTabs(page).getByRole("tab", { name: /GBP/ }),
  ).toHaveCount(0);
});

test("a currency with claims shows the claim-count chip", async ({ page }) => {
  await gotoCurrencies(page);
  await expect(currencyTab(page, "USD")).toContainText(String(USD_CLAIMS));
});

test("selecting a tab renders its claims and rates tables", async ({
  page,
}) => {
  await gotoCurrencies(page);
  await currencyTab(page, "USD").click();

  await expect(claimsTable(page)).toBeVisible();
  await expect(ratesTable(page)).toBeVisible();

  await expect(tableDataRows(page, claimsTable(page))).toHaveCount(USD_CLAIMS);
  await expect(tableDataRows(page, ratesTable(page)).first()).toBeVisible();
});
