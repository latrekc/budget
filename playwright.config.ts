import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/helpers/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI emit GitHub annotations AND an HTML report (uploaded as an artifact).
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // No top-level `webServer`: servers are launched per-worker by the fixture in
  // tests/e2e/helpers/server.ts so each worker has an isolated DB + port.
});
