import type { Locator, Page } from "@playwright/test";

import {
  categoriesGroup,
  categoryModeRadio,
  openPopover,
  TESTID,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

// The small seed builds this tree (see helpers/seed.ts seedSmall):
//   Home (root) → Bills → Power
//   Earnings (root)

/** The edit-mode row (`div.group`) for a category, scoped by its visible name. */
function categoryRow(page: Page, name: string): Locator {
  return categoriesGroup(page)
    .locator("div.group")
    .filter({ hasText: name })
    .filter({ has: page.getByRole("button", { name: "Edit category" }) })
    .first();
}

async function enterEditMode(page: Page): Promise<void> {
  await page.goto("/transactions");
  await expect(categoriesGroup(page)).toBeVisible({ timeout: 15_000 });
  const editRadio = categoryModeRadio(page, "Edit");
  await expect(editRadio).toBeVisible();
  await editRadio.click({ force: true });
  await expect(editRadio).toBeChecked({ timeout: 10_000 });
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

test("add a root category", async ({ page }) => {
  await enterEditMode(page);

  // The root-level "Add category" button carries its label text. React-aria
  // wraps the <button> in a trigger element, so both match the name; take one.
  const addBtn = page.getByRole("button", { name: "Add category" }).first();
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible({ timeout: 15_000 });
  await popover.getByRole("textbox").fill("Travel");
  await popover.getByRole("textbox").press("Enter");

  await expect(popover).not.toBeVisible({ timeout: 15_000 });
  await expect(
    categoriesGroup(page).getByText("Travel", { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
});

test("add a subcategory under an existing category", async ({ page }) => {
  await enterEditMode(page);

  const addSubBtn = categoryRow(page, "Earnings")
    .getByRole("button", { name: "Add subcategory" })
    .first();
  await expect(addSubBtn).toBeVisible();
  await addSubBtn.click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible({ timeout: 15_000 });
  await popover.getByRole("textbox").fill("Salary");
  await popover.getByRole("textbox").press("Enter");

  await expect(popover).not.toBeVisible({ timeout: 15_000 });
  await expect(
    categoriesGroup(page).getByText("Salary", { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
});

test("edit a category name", async ({ page }) => {
  await enterEditMode(page);

  const editBtn = categoryRow(page, "Earnings")
    .getByRole("button", { name: "Edit category" })
    .first();
  await expect(editBtn).toBeVisible();
  await editBtn.click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible({ timeout: 15_000 });
  const input = popover.getByTestId(TESTID.editCategoryInput);
  await input.fill("Revenue");
  await input.press("Enter");

  await expect(popover).not.toBeVisible({ timeout: 15_000 });
  await expect(
    categoriesGroup(page).getByText("Revenue", { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    categoriesGroup(page).getByText("Earnings", { exact: true }),
  ).toHaveCount(0);
});

test("move a subcategory to a different parent", async ({ page }) => {
  await enterEditMode(page);

  // Move "Bills" (currently under Home) to root, then confirm it's a root.
  const moveBtn = categoryRow(page, "Bills")
    .getByRole("button", { name: "Move category" })
    .first();
  await expect(moveBtn).toBeVisible();
  await moveBtn.click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible({ timeout: 15_000 });

  // "Move to the root" is offered because Bills currently has a parent.
  const rootBtn = popover.getByRole("button", { name: "Move to the root" });
  await expect(rootBtn).toBeVisible();
  await rootBtn.click();
  await expect(popover).not.toBeVisible({ timeout: 15_000 });

  // Bills is now a root row: its own delete confirmation says "a root category".
  const delBtn = categoryRow(page, "Bills")
    .getByRole("button", { name: "Remove category" })
    .first();
  await expect(delBtn).toBeVisible();
  await delBtn.click();
  const confirm = openPopover(page);
  await expect(confirm).toContainText("a root category", { timeout: 15_000 });
});

test("delete a category with confirmation", async ({ page }) => {
  await enterEditMode(page);

  const delBtn = categoryRow(page, "Earnings")
    .getByRole("button", { name: "Remove category" })
    .first();
  await expect(delBtn).toBeVisible();
  await delBtn.click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible({ timeout: 15_000 });
  const yesBtn = popover.getByRole("button", { name: "Yes, remove" });
  await expect(yesBtn).toBeVisible();
  await yesBtn.click();

  await expect(
    categoriesGroup(page).getByText("Earnings", { exact: true }),
  ).toHaveCount(0);
});
