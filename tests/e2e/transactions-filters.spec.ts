import type { Page } from "@playwright/test";
import {
  currencyButton,
  descriptionFilter,
  expectTotalCountStable,
  gotoTransactions,
  onlyIncomeSwitch,
  onlyUncategorisedSwitch,
  SEED,
  transactionRows,
  urlParam,
} from "./helpers/selectors";

import { expect, test } from "./helpers/server";

// `search` is double-encoded by FiltersProvider (encodeURIComponent + URLSearchParams),
// so searchParams.get returns the once-encoded form; decode once for the logical value.
function searchValue(page: Page): string {
  return decodeURIComponent(urlParam(page, "search") ?? "");
}

// Seed-derived counts. Values with a direct SEED field are referenced from it so
// the seed stays the single source of truth; the rest are derived or verified
// against the golden DB.
const TOTAL = SEED.totalTransactions;
const COFFEE = SEED.descriptions.coffee;
const NOT_COFFEE = TOTAL - COFFEE;
const COFFEE_OR_RENT = COFFEE + SEED.descriptions.rent;
const NOT_COFFEE_AND_NOT_RENT = TOTAL - COFFEE_OR_RENT;
const ONLY_INCOME = 212;
const ONLY_UNCOMPLITED = 537;
const USD = SEED.currencies.USD;
const COFFEE_AND_INCOME = 8;

test("description search sets ?search and narrows rows", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("coffee");
  await expect
    .poll(() => searchValue(page), { timeout: 15_000 })
    .toBe("coffee");
  await expectTotalCountStable(page, COFFEE);
  await expect(transactionRows(page).first()).toContainText("coffee");
});

test("negative search (!term) excludes matches", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("!coffee");
  await expect
    .poll(() => searchValue(page), { timeout: 15_000 })
    .toBe("!coffee");
  await expectTotalCountStable(page, NOT_COFFEE);
});

test("OR search (a|b) includes both", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("coffee|rent");
  await expect
    .poll(() => searchValue(page), { timeout: 15_000 })
    .toBe("coffee|rent");
  await expectTotalCountStable(page, COFFEE_OR_RENT);
});

test("AND-of-not search (!a|b) excludes both", async ({ page }) => {
  await gotoTransactions(page);
  await descriptionFilter(page).fill("!coffee|rent");
  await expect
    .poll(() => searchValue(page), { timeout: 15_000 })
    .toBe("!coffee|rent");
  await expectTotalCountStable(page, NOT_COFFEE_AND_NOT_RENT);
});

test("Only uncategorised toggles ?onlyUncomplited", async ({ page }) => {
  await gotoTransactions(page);
  await expect(onlyUncategorisedSwitch(page)).toBeVisible();
  await onlyUncategorisedSwitch(page).click({ force: true });
  await expect
    .poll(() => urlParam(page, "onlyUncomplited"), { timeout: 15_000 })
    .toBe("true");
  await expectTotalCountStable(page, ONLY_UNCOMPLITED);
});

test("Only income toggles ?onlyIncome and filters to positive amounts", async ({
  page,
}) => {
  await gotoTransactions(page);
  await expect(onlyIncomeSwitch(page)).toBeVisible();
  await onlyIncomeSwitch(page).click({ force: true });
  await expect
    .poll(() => urlParam(page, "onlyIncome"), { timeout: 15_000 })
    .toBe("true");
  await expectTotalCountStable(page, ONLY_INCOME);
});

test("currency button toggles ?currencies and filters rows", async ({
  page,
}) => {
  await gotoTransactions(page);
  await expect(currencyButton(page, "USD")).toBeVisible();
  await currencyButton(page, "USD").click();
  // Toggling USD off from the default (all) leaves the other six currencies.
  await expect
    .poll(() => urlParam(page, "currencies"), { timeout: 15_000 })
    .toEqual(expect.stringContaining("GBP"));
  expect(urlParam(page, "currencies")).not.toContain("USD");
  await expectTotalCountStable(page, TOTAL - USD);
});

test("deep-link reproduces filter state", async ({ page }) => {
  await page.goto("/transactions?search=coffee");
  await expectTotalCountStable(page, COFFEE);

  await page.goto("/transactions?currencies=USD");
  await expectTotalCountStable(page, USD);

  await page.goto("/transactions?search=coffee&onlyIncome=true");
  await expectTotalCountStable(page, COFFEE_AND_INCOME);
});
