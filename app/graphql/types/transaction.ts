import prisma from "../../lib/prisma";
import { Currency, Source, enumFromStringValue } from "../../lib/types";
import { builder } from "../builder";

builder.enumType(Currency, {
  name: "Currency",
});

builder.enumType(Source, {
  name: "Source",
});

builder.prismaObject("Transaction", {
  fields: (t) => ({
    id: t.exposeID("id"),
    description: t.exposeString("description"),
    amount: t.exposeFloat("amount"),
    date: t.field({
      type: "Date",
      resolve: (transaction) => transaction.date,
    }),
    currency: t.field({
      type: Currency,
      resolve: (transaction) =>
        enumFromStringValue(Currency, transaction.currency),
    }),
    source: t.field({
      type: Source,
      resolve: (transaction) => enumFromStringValue(Source, transaction.source),
    }),
  }),
});

builder.queryField("transactions", (t) =>
  t.prismaConnection({
    type: "Transaction",
    cursor: "id",
    resolve: (query) =>
      prisma.transaction.findMany({ ...query, orderBy: [{ date: "desc" }] }),
  }),
);
