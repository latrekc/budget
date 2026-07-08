// Documentation screenshot capture (not an assertion suite).
//
// Runs against the read-only golden snapshot via the per-worker server fixture
// and writes illustrative PNGs into docs/screenshots/ for the README. Each
// scenario is its own test so a single flake never blocks the rest.

import fs from "fs";
import path from "path";

import {
  autocompleteInput,
  bulkSetCategoryButton,
  categoryModeRadio,
  currencyTab,
  dashboardCharts,
  descriptionFilter,
  expandSidebarSection,
  headerSelectAll,
  transactionRows,
  transactionsTable,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

const OUT_DIR = path.join(process.cwd(), "docs", "screenshots");

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test.beforeEach(() => {
  // Documentation screenshot generation is OFF by default (it isn't an assertion
  // suite and would otherwise run on every local `playwright test`). Opt in with
  // GENERATE_SCREENSHOTS=1 to regenerate the README images against the local
  // golden build. The suite is intentionally kept, just not run automatically.
  test.skip(
    !process.env.GENERATE_SCREENSHOTS,
    "screenshot capture disabled; set GENERATE_SCREENSHOTS=1 to regenerate",
  );
});

function shot(name: string): string {
  return path.join(OUT_DIR, name);
}

test("transactions overview", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  await page.screenshot({
    path: shot("transactions-overview.png"),
    fullPage: false,
  });
});

test("transactions select-all enables bulk set category", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  await transactionsTable(page).scrollIntoViewIfNeeded();
  // The header checkbox input extends past the left viewport edge, so a
  // coordinate click misses; focus it and toggle with the keyboard instead.
  await headerSelectAll(page).focus();
  await page.keyboard.press("Space");
  await expect(bulkSetCategoryButton(page)).toBeEnabled();
  await page.screenshot({
    path: shot("transactions-select-all.png"),
    fullPage: false,
  });
});

test("transactions description search", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  await descriptionFilter(page).fill("coffee");
  await expect
    .poll(() => new URL(page.url()).searchParams.get("search"))
    .toBe("coffee");
  await expect(transactionRows(page).first()).toBeVisible();
  await page.screenshot({
    path: shot("transactions-search.png"),
    fullPage: false,
  });
});

test("transactions sidebar filters", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  await expandSidebarSection(page, "Months");
  await expandSidebarSection(page, "Sources");
  await page.screenshot({
    path: shot("transactions-sidebar-filters.png"),
    fullPage: false,
  });
});

test("transactions currency conversion", async ({ page }) => {
  await page.goto("/transactions?currencies=USD&months=2026-01");
  await expect(transactionRows(page).first()).toBeVisible();
  await expect(transactionsTable(page)).toContainText("£");
  await page.screenshot({
    path: shot("transactions-currency-conversion.png"),
    fullPage: false,
  });
});

test("transactions missing exchange rate warning", async ({ page }) => {
  await page.goto("/transactions?currencies=USD&months=2019-01");
  await expect(
    transactionsTable(page).getByText("Exchange rate is not defined").first(),
  ).toBeVisible();
  await page.screenshot({
    path: shot("transactions-rate-missing.png"),
    fullPage: false,
  });
});

test("transactions category assignment popover", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  await transactionsTable(page).scrollIntoViewIfNeeded();
  // Select two rows, then open the bulk "Set category" autocomplete popover.
  const rows = transactionRows(page);
  await rows.nth(0).getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await rows.nth(1).getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await expect(bulkSetCategoryButton(page)).toBeEnabled();
  await bulkSetCategoryButton(page).click();
  const popover = page.getByRole("dialog");
  await expect(popover).toBeVisible();
  // Type a prefix so the autocomplete shows matching category options.
  await autocompleteInput(popover).fill("Co");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: shot("transactions-category-assign.png"),
    fullPage: false,
  });
});

test("categories edit mode", async ({ page }) => {
  await page.goto("/transactions");
  await expect(transactionRows(page).first()).toBeVisible();
  // Click the visible label so react-aria updates the radio's selected state
  // (a coordinate/force click on the hidden input leaves the UI on "Select").
  await page
    .getByRole("radiogroup", { name: "Category mode" })
    .getByText("Edit", { exact: true })
    .click();
  await expect(categoryModeRadio(page, "Edit")).toBeChecked();
  await page.screenshot({ path: shot("categories-edit.png"), fullPage: false });
});

test("dashboard charts", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(dashboardCharts(page).first()).toBeVisible();
  await expect
    .poll(() => dashboardCharts(page).count())
    .toBeGreaterThanOrEqual(2);
  // Let ECharts finish its entry animation before capturing.
  await page.waitForTimeout(1200);
  await page.screenshot({ path: shot("dashboard.png"), fullPage: false });
});

test("currencies with claims and rates", async ({ page }) => {
  await page.goto("/currencies");
  await currencyTab(page, "USD").click();
  await expect(
    page.getByRole("heading", { name: /Currency rates/ }),
  ).toBeVisible();
  await page.screenshot({ path: shot("currencies.png"), fullPage: false });
});
