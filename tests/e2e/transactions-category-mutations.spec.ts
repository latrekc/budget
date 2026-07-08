import {
  gotoTransactions,
  LABEL,
  SEED,
  transactionRows,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

// Warm up the Next server once to avoid cold-start RSC stall on first mutation test.
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
  // Authoritative reset: every test starts from known small dataset.
  await workerServer.resetDb("small");
});

// Restore the golden snapshot so read-only specs that later share this worker
// still see the large dataset. Best-effort: afterEach failure must not leave
// small DB for next worker-reuse.
test.afterEach(async ({ workerServer }) => {
  try {
    await workerServer.resetDb("large");
  } catch {
    // best-effort cleanup
  }
});

test("delete chip: removing a category chip from a transaction", async ({
  page,
}) => {
  await gotoTransactions(page);
  const rows = transactionRows(page);
  await expect
    .poll(() => rows.count(), { timeout: 15_000 })
    .toBe(SEED.small.transactions);

  // small-0 "coffee small" has the "Power" category chip.
  const row = rows.filter({ hasText: "coffee small" });
  await expect(row.getByText("Power")).toBeVisible({ timeout: 15_000 });

  // Click the remove button on the chip (title="Remove category").
  const rmBtn = row.getByRole("button", { name: LABEL.removeCategory });
  await expect(rmBtn).toBeVisible();
  await rmBtn.click();

  // Chip disappears and the row reverts to incomplete (lime highlight).
  await expect(row.getByText("Power")).not.toBeVisible({ timeout: 15_000 });
});
