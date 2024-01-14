import type PrismaTypes from "@pothos/plugin-prisma/generated";

import SchemaBuilder from "@pothos/core";
import ErrorsPlugin from "@pothos/plugin-errors";
// eslint-disable-next-line import/no-named-as-default
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaUtils from "@pothos/plugin-prisma-utils";
import RelayPlugin from "@pothos/plugin-relay";
import { DateTimeResolver } from "graphql-scalars";

import prisma from "../lib/prisma";

export const builder = new SchemaBuilder<{
  DefaultFieldNullability: true;
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  defaultFieldNullability: true,
  errorOptions: {
    defaultTypes: [],
  },
  plugins: [PrismaPlugin, PrismaUtils, RelayPlugin, ErrorsPlugin],
  prisma: {
    client: prisma,
  },
  relayOptions: {},
});

builder.objectType(Error, {
  fields: (t) => ({
    message: t.exposeString("message"),
  }),
  name: "Error",
});

builder.queryType({
  fields: (t) => ({
    ok: t.boolean({
      resolve: () => true,
    }),
  }),
});

builder.addScalarType("Date", DateTimeResolver, {});
