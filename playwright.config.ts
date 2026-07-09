import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/helpers/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The per-worker fixture (helpers/server.ts) spawns a full `next start` server
  // per worker. On the 2-core CI runner, multiple heavy servers starve the CPU
  // and cause client-side RSC navigation/mutations to stall, so pin CI to a
  // single worker. Locally (undefined) Playwright still uses all cores.
  workers: process.env.CI ? 1 : undefined,
  // In CI emit GitHub annotations AND an HTML report (uploaded as an artifact).
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // The full e2e suite is too slow, so run only a minimal smoke set (matched by
  // title) both locally and in CI.
  grep: [/table renders with the expected columns/],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // Enable the Chromium sandbox locally, but disable it in CI: GitHub's
          // Linux runners don't provide the kernel privileges Chromium needs to
          // sandbox, so forcing it there fails with "Chromium sandboxing failed!".
          chromiumSandbox: !process.env.CI,
        },
      },
    },
  ],
  // No top-level `webServer`: servers are launched per-worker by the fixture in
  // tests/e2e/helpers/server.ts so each worker has an isolated DB + port.
});
