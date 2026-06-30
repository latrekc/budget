// Per-worker server fixture: every Playwright worker gets its own SQLite copy of
// the golden snapshot AND its own Next server on a dedicated port. Because a
// worker runs one test at a time, this guarantees each concurrently-running test
// owns an isolated DB + server, so tests can run fully in parallel safely.

import { test as base, expect } from "@playwright/test";
import { ChildProcess, spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const E2E_DIR = path.join(ROOT, "e2e");
const GOLDEN = path.join(E2E_DIR, "golden.sqlite");
const BASE_PORT = 3100;

export type WorkerServer = {
  baseURL: string;
  /**
   * Restore the worker DB to a clean snapshot and restart the server.
   * "large" re-copies the golden snapshot (fast file copy); "small" reseeds the
   * low-cardinality dataset for mutation specs that need predictable data.
   */
  resetDb: (variant?: "large" | "small") => Promise<void>;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServer(port: number, databaseUrl: string): ChildProcess {
  // `pnpm start` -> next start -p $PORT. detached:true puts the whole chain
  // (pnpm -> ts-node -> next) in its own process group so we can kill it all.
  return spawn("pnpm", ["start"], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_FILE: databaseUrl,
    },
  });
}

async function stopServer(proc: ChildProcess): Promise<void> {
  if (proc.pid == null || proc.exitCode != null || proc.signalCode != null) {
    return;
  }
  const pid = proc.pid;
  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    proc.once("exit", done);
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      done();
      return;
    }
    setTimeout(() => {
      try {
        process.kill(-pid, "SIGKILL");
      } catch {
        // already gone
      }
      done();
    }, 5000);
  });
}

async function waitForHttp(url: string, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status > 0) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(
    `Server at ${url} did not respond within ${timeoutMs}ms: ${String(lastError)}`,
  );
}

function seedSmallInto(databaseUrl: string): void {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "ts-node",
      "-O",
      '{"module":"commonjs"}',
      "./tests/e2e/helpers/seed.ts",
      "--small",
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, DATABASE_FILE: databaseUrl },
    },
  );
  if (result.status !== 0) {
    throw new Error(`small reseed exited with ${result.status}`);
  }
}

export const test = base.extend<
  Record<never, never>,
  { workerServer: WorkerServer }
>({
  workerServer: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const index = workerInfo.workerIndex;
      const port = BASE_PORT + index;
      const baseUrl = `http://localhost:${port}`;
      const dbFile = path.join(E2E_DIR, `worker-${index}.sqlite`);
      const databaseUrl = `file:./e2e/worker-${index}.sqlite`;

      fs.copyFileSync(GOLDEN, dbFile);
      let proc = startServer(port, databaseUrl);
      await waitForHttp(`${baseUrl}/transactions`);

      const resetDb = async (variant: "large" | "small" = "large") => {
        await stopServer(proc);
        if (variant === "small") {
          seedSmallInto(databaseUrl);
        } else {
          fs.copyFileSync(GOLDEN, dbFile);
        }
        proc = startServer(port, databaseUrl);
        await waitForHttp(`${baseUrl}/transactions`);
      };

      await use({ baseURL: baseUrl, resetDb });

      await stopServer(proc);
      fs.rmSync(dbFile, { force: true });
    },
    { scope: "worker" },
  ],

  // Point page.goto() / relative URLs at this worker's dedicated server.
  baseURL: async ({ workerServer }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(workerServer.baseURL);
  },
});

export { expect };
