// Playwright global setup: build the app once and build the golden DB once.
//
// Both steps are skipped when their output already exists so local iteration is
// fast; CI runs from a clean checkout and therefore always performs them.

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      // Ensure any module that lazily touches Prisma during `next build` has a
      // valid DB path even if one was not exported by the caller.
      DATABASE_FILE: process.env.DATABASE_FILE ?? "file:./e2e/golden.sqlite",
    },
  });
  if (result.status !== 0) {
    throw new Error(
      `\`${command} ${args.join(" ")}\` exited with ${result.status}`,
    );
  }
}

export default async function globalSetup(): Promise<void> {
  const golden = path.join(ROOT, "e2e", "golden.sqlite");
  if (!fs.existsSync(golden)) {
    run("pnpm", ["e2e:setup"]);
  }

  const buildId = path.join(ROOT, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    run("pnpm", ["build"]);
  }
}
