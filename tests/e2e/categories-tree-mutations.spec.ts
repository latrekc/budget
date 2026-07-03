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
  await expect(categoriesGroup(page)).toBeVisible();
  await categoryModeRadio(page, "Edit").click({ force: true });
}

test.beforeEach(async ({ workerServer }) => {
  await workerServer.resetDb("small");
});

// Restore the golden snapshot so read-only specs that later share this worker
// still see the large dataset (workers are reused across spec files).
test.afterEach(async ({ workerServer }) => {
  await workerServer.resetDb("large");
});

test("add a root category", async ({ page }) => {
  await enterEditMode(page);

  // The root-level "Add category" button carries its label text. React-aria
  // wraps the <button> in a trigger element, so both match the name; take one.
  await page.getByRole("button", { name: "Add category" }).first().click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();
  await popover.getByRole("textbox").fill("Travel");
  await popover.getByRole("textbox").press("Enter");

  await expect(popover).not.toBeVisible();
  await expect(
    categoriesGroup(page).getByText("Travel", { exact: true }),
  ).toBeVisible();
});

test("add a subcategory under an existing category", async ({ page }) => {
  await enterEditMode(page);

  await categoryRow(page, "Earnings")
    .getByRole("button", { name: "Add subcategory" })
    .first()
    .click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();
  await popover.getByRole("textbox").fill("Salary");
  await popover.getByRole("textbox").press("Enter");

  await expect(popover).not.toBeVisible();
  await expect(
    categoriesGroup(page).getByText("Salary", { exact: true }),
  ).toBeVisible();
});

test("edit a category name", async ({ page }) => {
  await enterEditMode(page);

  await categoryRow(page, "Earnings")
    .getByRole("button", { name: "Edit category" })
    .first()
    .click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();
  const input = popover.getByTestId(TESTID.editCategoryInput);
  await input.fill("Revenue");
  await input.press("Enter");

  await expect(popover).not.toBeVisible();
  await expect(
    categoriesGroup(page).getByText("Revenue", { exact: true }),
  ).toBeVisible();
  await expect(
    categoriesGroup(page).getByText("Earnings", { exact: true }),
  ).toHaveCount(0);
});

test("move a subcategory to a different parent", async ({ page }) => {
  await enterEditMode(page);

  // Move "Bills" (currently under Home) to root, then confirm it's a root.
  await categoryRow(page, "Bills")
    .getByRole("button", { name: "Move category" })
    .first()
    .click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();

  // "Move to the root" is offered because Bills currently has a parent.
  await popover.getByRole("button", { name: "Move to the root" }).click();
  await expect(popover).not.toBeVisible();

  // Bills is now a root row: its own delete confirmation says "a root category".
  await categoryRow(page, "Bills")
    .getByRole("button", { name: "Remove category" })
    .first()
    .click();
  const confirm = openPopover(page);
  await expect(confirm).toContainText("a root category");
});

test("delete a category with confirmation", async ({ page }) => {
  await enterEditMode(page);

  await categoryRow(page, "Earnings")
    .getByRole("button", { name: "Remove category" })
    .first()
    .click();
  const popover = openPopover(page);
  await expect(popover).toBeVisible();
  await popover.getByRole("button", { name: "Yes, remove" }).click();

  await expect(
    categoriesGroup(page).getByText("Earnings", { exact: true }),
  ).toHaveCount(0);
});
