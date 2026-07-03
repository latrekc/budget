import { gotoTransactions, LABEL, transactionRows } from "./helpers/selectors";
import { expect, test } from "./helpers/server";

test.beforeEach(async ({ workerServer }) => {
  await workerServer.resetDb("small");
});

// Restore the golden snapshot so read-only specs that later share this worker
// still see the large dataset (workers are reused across spec files).
test.afterEach(async ({ workerServer }) => {
  await workerServer.resetDb("large");
});

test("delete chip: removing a category chip from a transaction", async ({
  page,
}) => {
  await gotoTransactions(page);
  const rows = transactionRows(page);
  await expect(rows).toHaveCount(8);

  // small-0 "coffee small" has the "Power" category chip.
  const row = rows.filter({ hasText: "coffee small" });
  await expect(row.getByText("Power")).toBeVisible();

  // Click the remove button on the chip (title="Remove category").
  await row.getByRole("button", { name: LABEL.removeCategory }).click();

  // Chip disappears and the row reverts to incomplete (lime highlight).
  await expect(row.getByText("Power")).not.toBeVisible();
});
