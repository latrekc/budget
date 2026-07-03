#!/usr/bin/env ts-node-script
import { loadEnvConfig } from "@next/env";
import { spawnSync } from "child_process";

// Launcher for `next dev` / `next start`.
//
// Next's CLI reads the port from `-p`/`PORT` while *parsing argv*, which happens
// before it loads any `.env` files. As a result a `PORT` defined only in `.env`
// is ignored, and an unset `PORT` silently falls back to 3000. We load the env
// files here (using the same loader Next uses) *before* invoking Next, so both
// `.env` and inline/shell variables work. loadEnvConfig never overrides values
// already present in process.env, so an inline variable still takes precedence.
const command = process.argv[2];
if (command !== "dev" && command !== "start") {
  throw new Error(
    `serve.ts expects "dev" or "start" as its argument, received "${command ?? ""}".`,
  );
}

const isDev = command === "dev";
loadEnvConfig(process.cwd(), isDev);

const { DATABASE_FILE, PORT } = process.env;
if (!DATABASE_FILE) {
  throw new Error(
    "DATABASE_FILE environment variable is not set. Set it inline or in .env (e.g. file:./database.sqlite).",
  );
}
if (!PORT) {
  throw new Error(
    "PORT environment variable is not set. Set it inline or in .env (e.g. 3000).",
  );
}

const result = spawnSync("next", [command, "-p", PORT], { stdio: "inherit" });
process.exit(result.status ?? 1);
