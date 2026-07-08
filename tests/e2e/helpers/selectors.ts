// Shared, unambiguous locators and small page-object helpers for the E2E specs.
//
// Locator policy (plan §8), in priority order:
//   1. accessible role + unique accessible name;
//   2. an ambiguous role/name scoped inside a uniquely-identifiable container
//      (table by heading, popover by its trigger);
//   3. existing data-testid.
// Every §8 ambiguity has a committed resolution encoded here so specs stay
// declarative.

import { expect, type Locator, type Page } from "@playwright/test";

export { SEED } from "./seed";

/** Stable data-testids that exist in the production components. */
export const TESTID = {
  amountInputField: "amount-input-field",
  autocomplete: "autocomplete",
  autocompleteInput: "autocomplete-input",
  autocompleteItems: "autocomplete-items",
  bulkSetCategory: "categories-button",
  checkboxGroup: "checkbox-group",
  clearButton: "clear-button",
  currencyButton: "currency-button",
  editCategoryInput: "input",
  editCategoryError: "error",
  rowAddCategory: "add-button-trigger",
  sourceItem: "source-item",
  splitCategory: "btn-Split-category",
} as const;

/** Accessible names / aria-labels used as locators. */
export const LABEL = {
  amountRelation: "Amount relation",
  categoryMode: "Category mode",
  currencies: "Currencies",
  filterByCategory: "Filter by category",
  filterByMonth: "Filter by month",
  filterByName: "Filter by name",
  filterBySource: "Filter by source",
  ratesTable: "Rates",
  removeCategory: "Remove category",
  removeRate: "Remove rate",
  searchByDescription: "Search by description",
  selectAll: "Select all",
  setCategory: "Set category",
  splitCategory: "Split category",
  transactionsTable: "Transaction",
} as const;

/**
 * URL query-param names. NOTE: `onlyUncomplited` is misspelled in the app; specs
 * read/write the actual (misspelled) string on purpose (plan §8).
 */
export const URL_PARAM = {
  amount: "amount",
  amountRelation: "amountRelation",
  categories: "categories",
  currencies: "currencies",
  ignoreCategories: "ignoreCategories",
  months: "months",
  onlyIncome: "onlyIncome",
  onlyUncomplited: "onlyUncomplited",
  search: "search",
  sortBy: "sortBy",
  sources: "sources",
} as const;

// --- navigation -----------------------------------------------------------

export function gotoTransactions(page: Page) {
  return page.goto("/transactions");
}

export function gotoDashboard(page: Page) {
  return page.goto("/dashboard");
}

export function gotoCurrencies(page: Page) {
  return page.goto("/currencies");
}

export function navLink(page: Page, name: string): Locator {
  return page.getByRole("navigation").getByRole("link", { name });
}

/** Balances/Shares are disabled visual-only text, not links. */
export function navDisabledItem(page: Page, name: string): Locator {
  return page.getByRole("navigation").getByText(name, { exact: true });
}

// --- transactions table ---------------------------------------------------

export function transactionsTable(page: Page): Locator {
  return page.getByRole("grid", { name: LABEL.transactionsTable });
}

/** Data rows only (excludes the column-header row and the load-more spinner row). */
export function transactionRows(page: Page): Locator {
  return transactionsTable(page)
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader") });
}

export function headerSelectAll(page: Page): Locator {
  return page.getByRole("checkbox", { name: LABEL.selectAll });
}

export function emptyState(page: Page): Locator {
  return page.getByText("No records");
}

/** Scroll the transactions table's scroll container to the bottom (triggers load-more). */
export async function scrollTransactionsToBottom(page: Page): Promise<void> {
  await transactionsTable(page)
    .locator("xpath=ancestor::*[contains(@class,'overflow-y-auto')][1]")
    .evaluate((el) => el.scrollTo(0, el.scrollHeight));
}

// --- top filters ----------------------------------------------------------

export function descriptionFilter(page: Page): Locator {
  return page.getByRole("textbox", { name: LABEL.searchByDescription });
}

export function amountFilter(page: Page): Locator {
  return page.getByTestId(TESTID.amountInputField);
}

export function currencyButtons(page: Page): Locator {
  return page.getByTestId(TESTID.currencyButton);
}

export function currencyButton(page: Page, currency: string): Locator {
  return currencyButtons(page).and(
    page.getByRole("button", { name: currency }),
  );
}

export function onlyUncategorisedSwitch(page: Page): Locator {
  return page.getByRole("switch", { name: "Only uncategorised" });
}

export function onlyIncomeSwitch(page: Page): Locator {
  return page.getByRole("switch", { name: "Only income" });
}

export function sortByAmountSwitch(page: Page): Locator {
  return page.getByRole("switch", { name: "Sort by amount" });
}

/** Assert the (filter-aware) TransactionsTotal count, independent of pagination. */
export async function expectTotalCount(
  page: Page,
  count: number,
): Promise<void> {
  await expect(
    page.getByText(new RegExp(`\\b${count}\\b\\s+transactions`)).first(),
  ).toBeVisible();
}

/** Assert total count with extended timeout for URL filter propagation. */
export async function expectTotalCountStable(
  page: Page,
  count: number,
): Promise<void> {
  await expect(
    page.getByText(new RegExp(`\\b${count}\\b\\s+transactions`)).first(),
  ).toBeVisible({ timeout: 15_000 });
}

/** Read a URL query param from the current page URL (decoded). */
export function urlParam(page: Page, name: string): null | string {
  return new URL(page.url()).searchParams.get(name);
}

// --- sidebar filters ------------------------------------------------------

export function categoryNameFilter(page: Page): Locator {
  return page.getByRole("textbox", { name: LABEL.filterByName });
}

export function categoryModeRadio(
  page: Page,
  mode: "Edit" | "Ignore" | "Select",
): Locator {
  return page
    .getByRole("radiogroup", { name: LABEL.categoryMode })
    .getByRole("radio", { name: mode });
}

export function sourceItems(page: Page): Locator {
  return page.getByTestId(TESTID.sourceItem);
}

export function sourcesGroup(page: Page): Locator {
  return page.getByRole("group", { name: LABEL.filterBySource });
}

export function categoriesGroup(page: Page): Locator {
  return page.getByRole("group", { name: LABEL.filterByCategory });
}

/** The FiltersCategories scroll container (holds chips + name filter + tree). */
export function categoriesSidebar(page: Page): Locator {
  return categoriesGroup(page).locator(
    "xpath=ancestor::*[contains(@class,'overflow-scroll')][1]",
  );
}

/** Scroll a (possibly off-screen, nested-scroll) element into view, then click it. */
export async function clickInScroll(target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  await target.click({ force: true });
}

export function monthsGroup(page: Page): Locator {
  return page.getByRole("group", { name: LABEL.filterByMonth });
}

/** Expand a sidebar accordion section (Categories/Months/Sources) by its heading. */
export function expandSidebarSection(page: Page, name: string): Promise<void> {
  return page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
}

// --- category autocomplete (shared by row-add, bulk and split) -----------

/** The combobox inside a given container (popover/dialog), or the page. */
export function autocompleteInput(scope: Locator | Page): Locator {
  return scope.getByTestId(TESTID.autocompleteInput);
}

export function autocompleteOption(
  scope: Locator | Page,
  name: string,
): Locator {
  return scope
    .getByTestId(TESTID.autocompleteItems)
    .getByRole("option", { name });
}

// --- per-row / bulk category actions --------------------------------------

export function rowAddCategoryButton(row: Locator): Locator {
  return row.getByTestId(TESTID.rowAddCategory);
}

export function rowSplitCategoryButton(row: Locator): Locator {
  return row.getByTestId(TESTID.splitCategory);
}

export function bulkSetCategoryButton(page: Page): Locator {
  return page.getByTestId(TESTID.bulkSetCategory);
}

/** The currently-open popover/dialog (split, add, set-category, confirm). */
export function openPopover(page: Page): Locator {
  return page.getByRole("dialog");
}

export async function openSplitPopover(row: Locator): Promise<Locator> {
  await rowSplitCategoryButton(row).click();
  const page = row.page();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();
  return popover;
}

// --- currencies -----------------------------------------------------------

export function currencyTabs(page: Page): Locator {
  return page.getByRole("tablist", { name: LABEL.currencies });
}

export function currencyTab(page: Page, currency: string): Locator {
  return currencyTabs(page).getByRole("tab", { name: new RegExp(currency) });
}

// Both currency tables share aria-label="Rates"; scope each by its heading.
export function claimsTable(page: Page): Locator {
  return page.locator(
    `xpath=//h2[starts-with(normalize-space(.),"Claims for currency rates")]/following::*[@aria-label="${LABEL.ratesTable}"][1]`,
  );
}

export function ratesTable(page: Page): Locator {
  return page.locator(
    `xpath=//h2[starts-with(normalize-space(.),"Currency rates")]/following::*[@aria-label="${LABEL.ratesTable}"][1]`,
  );
}

export function rateDeleteButton(scope: Locator | Page): Locator {
  return scope.getByRole("button", { name: LABEL.removeRate });
}

// --- dashboard ------------------------------------------------------------

/** ECharts render to <canvas>; assert presence/interaction, not pixels. */
export function dashboardCharts(page: Page): Locator {
  return page.locator("canvas");
}
