/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from "@prisma/client";

const prismaClientPropertyName = `__prevent-name-collision__prisma`;
type GlobalThisWithPrismaClient = {
  [prismaClientPropertyName]: PrismaClient;
} & typeof globalThis;

const getPrismaClient = () => {
  const newGlobalThis = globalThis as GlobalThisWithPrismaClient;
  if (!newGlobalThis[prismaClientPropertyName]) {
    newGlobalThis[prismaClientPropertyName] = new PrismaClient();
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
