// 1.
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaUtils from "@pothos/plugin-prisma-utils";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import prisma from "../lib/prisma";
import { DateTimeResolver } from "graphql-scalars";

// 2.
export const builder = new SchemaBuilder<{
  // 3.
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  // 4.
  plugins: [PrismaPlugin, PrismaUtils],
  prisma: {
    client: prisma,
  },
});

// 5.
builder.queryType({
  fields: (t) => ({
    ok: t.boolean({
      resolve: () => true,
    }),
  }),
});

builder.addScalarType("Date", DateTimeResolver, {});
