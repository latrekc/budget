import type { Page } from "@playwright/test";
import {
  currencyButton,
  descriptionFilter,
  expectTotalCount,
  gotoTransactions,
  onlyIncomeSwitch,
  onlyUncategorisedSwitch,
  transactionRows,
  urlParam,
} from "./helpers/selectors";

import { expect, test } from "./helpers/server";

// `search` is double-encoded by FiltersProvider (encodeURIComponent + URLSearchParams),
// so searchParams.get returns the once-encoded form; decode once for the logical value.
function searchValue(page: Page): string {
  return decodeURIComponent(urlParam(page, "search") ?? "");
}

// Seed-derived counts (verified against the golden DB).
const TOTAL = 1056;
const COFFEE = 40;
const NOT_COFFEE = 1016;
const COFFEE_OR_RENT = 64;
const NOT_COFFEE_AND_NOT_RENT = 992;
const ONLY_INCOME = 212;
const ONLY_UNCOMPLITED = 537;
const USD = 96;
const COFFEE_AND_INCOME = 8;

test("description search sets ?search and narrows rows", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("coffee");
  await expect.poll(() => searchValue(page)).toBe("coffee");
  await expectTotalCount(page, COFFEE);
  await expect(transactionRows(page).first()).toContainText("coffee");
});

test("negative search (!term) excludes matches", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("!coffee");
  await expect.poll(() => searchValue(page)).toBe("!coffee");
  await expectTotalCount(page, NOT_COFFEE);
});

test("OR search (a|b) includes both", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("coffee|rent");
  await expect.poll(() => searchValue(page)).toBe("coffee|rent");
  await expectTotalCount(page, COFFEE_OR_RENT);
});

test("AND-of-not search (!a|b) excludes both", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("!coffee|rent");
  await expect.poll(() => searchValue(page)).toBe("!coffee|rent");
  await expectTotalCount(page, NOT_COFFEE_AND_NOT_RENT);
});

test("Only uncategorised toggles ?onlyUncomplited", async ({ page }) => {
  await gotoTransactions(page);
  await onlyUncategorisedSwitch(page).click({ force: true });
  await expect.poll(() => urlParam(page, "onlyUncomplited")).toBe("true");
  await expectTotalCount(page, ONLY_UNCOMPLITED);
});

test("Only income toggles ?onlyIncome and filters to positive amounts", async ({
  page,
}) => {
  await gotoTransactions(page);
  await onlyIncomeSwitch(page).click({ force: true });
  await expect.poll(() => urlParam(page, "onlyIncome")).toBe("true");
  await expectTotalCount(page, ONLY_INCOME);
});

test("currency button toggles ?currencies and filters rows", async ({
  page,
}) => {
  await gotoTransactions(page);
  await currencyButton(page, "USD").click();
  // Toggling USD off from the default (all) leaves the other six currencies.
  await expect
    .poll(() => urlParam(page, "currencies"))
    .toEqual(expect.stringContaining("GBP"));
  expect(urlParam(page, "currencies")).not.toContain("USD");
  await expectTotalCount(page, TOTAL - USD);
});

test("deep-link reproduces filter state", async ({ page }) => {
  await page.goto("/transactions?search=coffee");
  await expectTotalCount(page, COFFEE);

  await page.goto("/transactions?currencies=USD");
  await expectTotalCount(page, USD);

  await page.goto("/transactions?search=coffee&onlyIncome=true");
  await expectTotalCount(page, COFFEE_AND_INCOME);
});
