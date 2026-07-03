import { gotoTransactions, transactionsTable } from "./helpers/selectors";
import { expect, test } from "./helpers/server";

test("table renders with the expected columns", async ({ page }) => {
  await gotoTransactions(page);
  const table = transactionsTable(page);
  await expect(table).toBeVisible();
  for (const name of ["Source", "Description", "Amount", "Categories"]) {
    await expect(table.getByRole("columnheader", { name })).toBeVisible();
  }
});
