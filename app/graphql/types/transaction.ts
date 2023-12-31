import prisma, { parseId, parseIdString } from "../../lib/prisma";
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
    categories: t.relation("categories"),
  }),
});

builder.prismaObject("TransactionsOnCategories", {
  fields: (t) => ({
    transaction: t.relation("transaction"),
    category: t.relation("category"),
    amount: t.exposeFloat("amount"),
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

const updateCategoriesForTransactionsInput = builder
  .inputRef<{
    transaction: string | number;
    category: string | number;
    amount: number;
  }>("updateCategoriesForTransactionsInput")
  .implement({
    fields: (t) => ({
      transaction: t.id({
        required: true,
      }),
      category: t.id({ required: true }),
      amount: t.int({ required: true }),
    }),
  });

builder.mutationFields((t) => ({
  updateCategoriesForTransactions: t.prismaField({
    type: ["Transaction"],
    args: {
      transactions: t.arg({
        type: [updateCategoriesForTransactionsInput],
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const transactionIds = args.transactions.map(
        ({ transaction }) => parseIdString(transaction)!,
      );

      await prisma.transactionsOnCategories.deleteMany({
        where: {
          transactionId: { in: transactionIds },
        },
      });

      const inserts = args.transactions.map(
        ({ transaction, category, amount }) =>
          prisma.transactionsOnCategories.create({
            data: {
              categoryId: parseId(category)!,
              transactionId: parseIdString(transaction)!,
              amount,
            },
          }),
      );

      await prisma.$transaction(inserts);

      return await prisma.transaction.findMany({
        ...query,
        where: {
          id: {
            in: transactionIds,
          },
        },
      });
    },
  }),
}));
