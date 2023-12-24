import { Currency, Source, enumFromStringValue } from "@app/lib/types";
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

// 1.
builder.queryField("transactions", (t) =>
  // 2.
  t.prismaField({
    // 3.
    type: ["Transaction"],
    // 4.
    resolve: (query, _parent, _args, _ctx, _info) =>
      prisma.transaction.findMany({ ...query }),
  }),
);
