import { Prisma } from "@prisma/client";

import { PrismaClient } from ".prisma/client";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientPropertyName = `__prevent-name-collision__prisma`;
type GlobalThisWithPrismaClient = {
  [prismaClientPropertyName]: PrismaClient;
} & typeof globalThis;

const getPrismaClient = () => {
  const newGlobalThis = globalThis as GlobalThisWithPrismaClient;
  if (!newGlobalThis[prismaClientPropertyName]) {
    newGlobalThis[prismaClientPropertyName] = new PrismaClient({
      adapter: new PrismaBetterSqlite3({
          url: "file:./database.sqlite",
      }),
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
