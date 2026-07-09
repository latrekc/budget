// Playwright global setup: build the app once and pre-build each golden DB
// variant once.
//
// There are two pre-built snapshots — golden.sqlite (large read dataset) and
// golden-small.sqlite (low-cardinality mutation dataset). Building them here,
// once, means the per-worker fixture can restore either variant with a plain
// file copy instead of spawning a ts-node + Prisma seed on every mutation test.
//
// Every step is skipped when its output already exists so local iteration is
// fast; the snapshots are committed fixtures, so a clean CI checkout already has
// them and only the app build runs.

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
  // The Linux OOM killer sends SIGKILL to `next build` when the runner runs out
  // of memory. Depending on whether the signal reaches this child directly or
  // the intervening `pnpm` process, it surfaces either as signal === "SIGKILL"
  // or as exit code 137 (128 + SIGKILL, reported by pnpm as ELIFECYCLE). Treat
  // both as an infrastructure failure — not a task/test failure — and emit an
  // explicit marker so the verifier can skip the reward instead of scoring a
  // memory-starved runner as a real regression.
  if (result.signal === "SIGKILL" || result.status === 137) {
    const marker =
      `__INFRA_ERROR__ e2e OOM during \`${command} ${args.join(" ")}\` ` +
      `(signal=${result.signal ?? "none"}, status=${result.status ?? "none"}): ` +
      `the process was killed by the OOM killer — give the runner more memory.`;
    console.error(marker);
    throw new Error(marker);
  }

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

  const goldenSmall = path.join(ROOT, "e2e", "golden-small.sqlite");
  if (!fs.existsSync(goldenSmall)) {
    run("pnpm", ["e2e:setup:small"]);
  }

  const buildId = path.join(ROOT, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    // Use the lean build (webpack + no browser source maps) so peak memory
    // stays under the CI cap. Turbopack and source-map generation are the two
    // biggest contributors to the OOM SIGKILL seen on memory-limited runners.
    run("pnpm", ["build:e2e"]);
  }
}
