import {
  categoriesGroup,
  clickInScroll,
  dashboardCharts,
  expandSidebarSection,
  monthsGroup,
  urlParam,
} from "./helpers/selectors";
import { expect, test } from "./helpers/server";

test("both ECharts render", async ({ page }) => {
  await page.goto("/dashboard");
  // Bar (time-period) chart + dual sunburst → at least two canvases.
  await expect(dashboardCharts(page).first()).toBeVisible();
  await expect
    .poll(() => dashboardCharts(page).count())
    .toBeGreaterThanOrEqual(2);
});

test("sidebar category filter updates the URL", async ({ page }) => {
  await page.goto("/dashboard");
  await clickInScroll(
    categoriesGroup(page).getByRole("checkbox", { name: "Coffee" }),
  );
  await expect.poll(() => urlParam(page, "categories")).toContain("13");
});

test("sidebar month filter updates the URL", async ({ page }) => {
  await page.goto("/dashboard");
  await expandSidebarSection(page, "Months");
  await clickInScroll(
    monthsGroup(page).getByRole("checkbox", { name: /June/ }),
  );
  await expect.poll(() => urlParam(page, "months")).toBe("2026-06");
});

test("the dashboard has no sources filter", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(categoriesGroup(page)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Sources/ })).toHaveCount(0);
});

test("clicking a bar category toggles the category filter", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const barChart = dashboardCharts(page).first();
  await expect(barChart).toBeVisible();

  const box = await barChart.boundingBox();
  if (box == null) {
    throw new Error("bar chart has no bounding box");
  }

  // ECharts renders to a canvas (no DOM nodes per bar). Sweep clicks across the
  // plot area until a category series is hit and the filter toggles on.
  for (
    let fx = 0.2;
    fx <= 0.8 && urlParam(page, "categories") == null;
    fx += 0.1
  ) {
    for (let fy = 0.3; fy <= 0.85; fy += 0.1) {
      await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
      try {
        await expect
          .poll(() => urlParam(page, "categories"), { timeout: 500 })
          .not.toBeNull();
        break;
      } catch {
        // keep sweeping
      }
    }
  }

  await expect.poll(() => urlParam(page, "categories")).not.toBeNull();
});
