import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaUtils from "@pothos/plugin-prisma-utils";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import RelayPlugin from "@pothos/plugin-relay";
import { DateTimeResolver } from "graphql-scalars";
import prisma from "../lib/prisma";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin, PrismaUtils, RelayPlugin],
  relayOptions: {},
  prisma: {
    client: prisma,
  },
});

builder.queryType({
  fields: (t) => ({
    ok: t.boolean({
      resolve: () => true,
    }),
  }),
});

builder.addScalarType("Date", DateTimeResolver, {});
