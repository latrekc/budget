import {
  gotoTransactions,
  navDisabledItem,
  navLink,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

test("/ redirects to /transactions", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/transactions$/);
});

test("header exposes Transactions, Dashboard and Currencies as links", async ({
  page,
}) => {
  await gotoTransactions(page);
  await expect(navLink(page, "Transactions")).toBeVisible();
  await expect(navLink(page, "Dashboard")).toBeVisible();
  await expect(navLink(page, "Currencies")).toBeVisible();
});

test("header links navigate to each page", async ({ page }) => {
  await gotoTransactions(page);

  await navLink(page, "Dashboard").click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await navLink(page, "Currencies").click();
  await expect(page).toHaveURL(/\/currencies$/);

  await navLink(page, "Transactions").click();
  await expect(page).toHaveURL(/\/transactions$/);
});

test("active link carries aria-current=page", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(navLink(page, "Dashboard")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(navLink(page, "Transactions")).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Balances and Shares are disabled, non-link text", async ({ page }) => {
  await gotoTransactions(page);
  await expect(navDisabledItem(page, "Balances")).toBeVisible();
  await expect(navDisabledItem(page, "Shares")).toBeVisible();
  await expect(page.getByRole("link", { name: "Balances" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Shares" })).toHaveCount(0);
});
