import { Prisma } from "@prisma/client";

import { PrismaClient } from ".prisma/client";

import { loadEnvConfig } from "@next/env";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientPropertyName = `__prevent-name-collision__prisma`;
type GlobalThisWithPrismaClient = {
  [prismaClientPropertyName]: PrismaClient;
} & typeof globalThis;

const getPrismaClient = () => {
  const newGlobalThis = globalThis as GlobalThisWithPrismaClient;
  if (!newGlobalThis[prismaClientPropertyName]) {
    // Load .env so any entry point (Next.js, ts-node scripts) can read
    // DATABASE_FILE. loadEnvConfig never overrides values already present in
    // process.env, so inline/shell variables and Next's own loading still win.
    // Skip it entirely when DATABASE_FILE is already set (Next.js runtime and
    // the Jest/next-jest test env both pre-load it) to avoid redundant env-file
    // scanning and the console noise @next/env emits under jsdom.
    if (!process.env.DATABASE_FILE) {
      loadEnvConfig(process.cwd());
    }
    const databaseFile = process.env.DATABASE_FILE;
    if (!databaseFile) {
      throw new Error(
        "DATABASE_FILE environment variable is not set. It must point to the SQLite database (e.g. file:./database.sqlite).",
      );
    }
    newGlobalThis[prismaClientPropertyName] = new PrismaClient({
      adapter: new PrismaBetterSqlite3(
        {
          url: databaseFile,
        },
        // The database stores DateTime columns as integer epoch-ms (the
        // legacy Prisma SQLite format). The v7 adapter defaults to binding
        // date filters as ISO-8601 text, which never matches an integer
        // column, so range filters (e.g. month) silently return nothing.
        { timestampFormat: "unixepoch-ms" },
      ),
    });
  }
  return newGlobalThis[prismaClientPropertyName];
};

const prisma = getPrismaClient().$extends({
  model: {
    $allModels: {
      async exists<T>(
        this: T,
        where: Prisma.Args<T, "findFirst">["where"],
      ): Promise<boolean> {
        // Get the current model at runtime
        const context = Prisma.getExtensionContext(this);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (context as any).findFirst({ where });
        return result !== null;
      },
    },
  },
});

export function parseId(id: null | number | string | undefined) {
  if (id != null) {
    return Number(id);
  }
  return null;
}

export function parseIdString(id: null | number | string | undefined) {
  if (id != null) {
    return String(id);
  }
  return null;
}

export default prisma;
