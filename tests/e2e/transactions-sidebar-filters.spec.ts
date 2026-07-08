import {
  categoriesGroup,
  categoriesSidebar,
  categoryModeRadio,
  categoryNameFilter,
  clickInScroll,
  expandSidebarSection,
  expectTotalCountStable,
  gotoTransactions,
  LABEL,
  monthsGroup,
  SEED,
  sourcesGroup,
  urlParam,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

// Seed-derived counts. TOTAL comes from the seed's single source of truth; the
// category/source/month breakdowns are verified against the golden DB.
const TOTAL = SEED.totalTransactions;
const COFFEE_CAT = 75; // transactions assigned to Coffee (id 13)
const LIVING_3LEVEL = 281; // Living + children + grandchildren (NOT great-grandchild)
const IGNORE_COFFEE = TOTAL - COFFEE_CAT;
const MONZO = 132;
const JUN_2026 = 11;

test("categories Select mode filters and adds a removable chip", async ({
  page,
}) => {
  await gotoTransactions(page);
  await clickInScroll(
    categoriesGroup(page).getByRole("checkbox", { name: "Coffee" }),
  );

  await expect
    .poll(() => urlParam(page, "categories"), { timeout: 15_000 })
    .toContain("13");
  await expectTotalCountStable(page, COFFEE_CAT);

  // Remove via the chip's delete button (scoped to the categories sidebar).
  const removeBtn = categoriesSidebar(page)
    .getByRole("button", { name: LABEL.removeCategory })
    .first();
  await expect(removeBtn).toBeVisible();
  await removeBtn.click();
  await expect
    .poll(() => urlParam(page, "categories"), { timeout: 15_000 })
    .toBeNull();
  await expectTotalCountStable(page, TOTAL);
});

test("categories Ignore mode excludes the chosen category", async ({
  page,
}) => {
  await gotoTransactions(page);
  const ignoreRadio = categoryModeRadio(page, "Ignore");
  await expect(ignoreRadio).toBeVisible();
  await ignoreRadio.click({ force: true });
  await expect(ignoreRadio).toBeChecked({ timeout: 10_000 });

  await clickInScroll(
    categoriesGroup(page).getByRole("checkbox", { name: "Coffee" }),
  );

  await expect
    .poll(() => urlParam(page, "ignoreCategories"), { timeout: 15_000 })
    .toContain("13");
  await expectTotalCountStable(page, IGNORE_COFFEE);
});

test("category name filter narrows the visible tree", async ({ page }) => {
  await gotoTransactions(page);
  await expect(
    categoriesGroup(page).getByRole("checkbox", { name: "Transport" }),
  ).toBeVisible();

  await categoryNameFilter(page).fill("Coffee");

  await expect(
    categoriesGroup(page).getByRole("checkbox", { name: "Coffee" }),
  ).toBeVisible();
  await expect(
    categoriesGroup(page).getByRole("checkbox", { name: "Transport" }),
  ).toHaveCount(0);
});

test("category filter expands to grandchildren but not great-grandchildren", async ({
  page,
}) => {
  await gotoTransactions(page);
  // Selecting the "Living" root expands to children + grandchildren only; the
  // 4th-level "Deposit" assignments are excluded (281, not 327).
  await clickInScroll(
    categoriesGroup(page).getByRole("checkbox", { name: "Living" }),
  );

  await expect
    .poll(() => urlParam(page, "categories"), { timeout: 15_000 })
    .toContain("1");
  await expectTotalCountStable(page, LIVING_3LEVEL);
});

test("months filter: select a month in the calendar year", async ({ page }) => {
  await gotoTransactions(page);
  await expandSidebarSection(page, "Months");

  // 2026 (the latest year) is expanded by default.
  await clickInScroll(
    monthsGroup(page).getByRole("checkbox", { name: /June/ }),
  );

  await expect
    .poll(() => urlParam(page, "months"), { timeout: 15_000 })
    .toBe("2026-06");
  await expectTotalCountStable(page, JUN_2026);
});

test("sources filter: selecting a source filters and adds the param", async ({
  page,
}) => {
  await gotoTransactions(page);
  await expandSidebarSection(page, "Sources");

  await clickInScroll(
    sourcesGroup(page).getByRole("checkbox", { name: /Monzo/ }),
  );

  await expect
    .poll(() => urlParam(page, "sources"), { timeout: 15_000 })
    .toBe("Monzo");
  await expectTotalCountStable(page, MONZO);
});
