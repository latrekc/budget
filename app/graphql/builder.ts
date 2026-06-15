import type PrismaTypes from "./pothos-prisma.generated";

import SchemaBuilder from "@pothos/core";
import ErrorsPlugin from "@pothos/plugin-errors";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaUtils from "@pothos/plugin-prisma-utils";
import RelayPlugin from "@pothos/plugin-relay";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { DateTimeResolver } from "graphql-scalars";
import prisma from "../lib/prisma";
import { getDatamodel } from "./pothos-prisma.generated";

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
  plugins: [
    PrismaPlugin,
    PrismaUtils,
    RelayPlugin,
    ErrorsPlugin,
    SimpleObjectsPlugin,
  ],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    exposeDescriptions: true,
  },
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
