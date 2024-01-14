import { Prisma } from "@prisma/client";
import { parse as parseDate } from "date-format-parse";

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
    amount: t.exposeFloat("amount"),
    categories: t.relation("categories"),
    completed: t.exposeBoolean("completed"),
    currency: t.field({
      resolve: (transaction) =>
        enumFromStringValue(Currency, transaction.currency),
      type: Currency,
    }),
    date: t.field({
      resolve: (transaction) => transaction.date,
      type: "Date",
    }),
    description: t.exposeString("description"),
    id: t.exposeID("id"),
    source: t.field({
      resolve: (transaction) => enumFromStringValue(Source, transaction.source),
      type: Source,
    }),
  }),
});

builder.prismaObject("TransactionsOnCategories", {
  fields: (t) => ({
    amount: t.exposeFloat("amount"),
    category: t.relation("category"),
    transaction: t.relation("transaction"),
  }),
});

type TransactionFilter = {
  month?: null | string;
  onlyUncomplited?: boolean | null;
  search?: null | string;
  sources?: null | string[];
};

const filterTransactionsInput = builder
  .inputRef<TransactionFilter>("filterTransactionsInput")
  .implement({
    fields: (t) => ({
      categories: t.stringList({
        required: false,
      }),
      month: t.string({
        required: false,
      }),
      onlyUncomplited: t.boolean({
        defaultValue: false,
        required: false,
      }),
      search: t.string({
        required: false,
      }),
      sources: t.stringList({
        required: false,
      }),
    }),
  });

function filtersToWhere(filters: TransactionFilter | null | undefined) {
  let where: Prisma.TransactionWhereInput | undefined = undefined;

  if (filters != null) {
    where = {};

    if (filters.onlyUncomplited) {
      where.completed = false;
    }

    if (filters.sources != null && filters.sources.length > 0) {
      where.source = {
        in: filters.sources,
      };
    }

    if (filters.month != null) {
      const month = parseDate(filters.month, "YYYY-MM");
      const nextMonth = new Date(month);
      nextMonth.setMonth(month.getMonth() + 1);
      where.date = {
        gte: month,
        lt: nextMonth,
      };
    }

    if (filters.search != null && filters.search.trim().length > 0) {
      where.description = {
        contains: filters.search.trim(),
      };
    }
  }

  return where;
}

builder.queryField("transactions", (t) =>
  t.prismaConnection({
    args: {
      filters: t.arg({
        required: false,
        type: filterTransactionsInput,
      }),
    },
    cursor: "id",
    resolve: async (query, _, args) => {
      return await prisma.transaction.findMany({
        ...query,
        orderBy: [{ date: "desc" }],
        where: filtersToWhere(args.filters),
      });
    },
    type: "Transaction",
  }),
);

builder.queryField("transactions_total", (t) =>
  t.int({
    args: {
      filters: t.arg({
        required: false,
        type: filterTransactionsInput,
      }),
    },
    resolve: async (_, args) => {
      return await prisma.transaction.count({
        orderBy: [{ date: "desc" }],
        where: filtersToWhere(args.filters),
      });
    },
  }),
);

const updateCategoriesForTransactionsInput = builder
  .inputRef<{
    amount: number;
    category: number | string;
    transaction: number | string;
  }>("updateCategoriesForTransactionsInput")
  .implement({
    fields: (t) => ({
      amount: t.float({ required: true }),
      category: t.id({ required: true }),
      transaction: t.id({
        required: true,
      }),
    }),
  });

builder.mutationFields((t) => ({
  deleteCategoriesForTransactions: t.prismaField({
    args: {
      transactions: t.arg({
        required: true,
        type: [updateCategoriesForTransactionsInput],
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const transactionIds = args.transactions.map(
        ({ transaction }) => parseIdString(transaction)!,
      );

      const deletes = args.transactions.map(({ category, transaction }) =>
        prisma.transactionsOnCategories.delete({
          where: {
            transactionId_categoryId: {
              categoryId: parseId(category)!,
              transactionId: parseIdString(transaction)!,
            },
          },
        }),
      );

      await prisma.$transaction([...deletes]);

      await prisma.transaction.updateMany({
        data: {
          completed: false,
        },
        where: {
          id: {
            in: transactionIds,
          },
        },
      });

      return await prisma.transaction.findMany({
        ...query,
        where: {
          id: {
            in: transactionIds,
          },
        },
      });
    },
    type: ["Transaction"],
  }),

  updateCategoriesForAllTransactions: t.prismaField({
    args: {
      category: t.arg.string({
        required: true,
      }),
      filters: t.arg({
        required: true,
        type: filterTransactionsInput,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const transactions = await prisma.transaction.findMany({
        ...query,
        orderBy: [{ date: "desc" }],
        where: filtersToWhere(args.filters),
      });

      const transactionIds = transactions.map(({ id }) => id);

      await prisma.transactionsOnCategories.deleteMany({
        where: {
          transactionId: { in: transactionIds },
        },
      });

      await prisma.transaction.updateMany({
        data: {
          completed: true,
        },
        where: {
          id: {
            in: transactionIds,
          },
        },
      });

      const categoryId = parseId(args.category)!;

      const inserts = transactions.map(({ amount, id: transactionId }) =>
        prisma.transactionsOnCategories.create({
          data: {
            amount,
            categoryId,
            transactionId,
          },
        }),
      );

      await prisma.$transaction([...inserts]);

      return [];
    },
    type: ["Transaction"],
  }),

  updateCategoriesForTransactions: t.prismaField({
    args: {
      transactions: t.arg({
        required: true,
        type: [updateCategoriesForTransactionsInput],
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const transactionIds = args.transactions.map(
        ({ transaction }) => parseIdString(transaction)!,
      );

      const transactions = await prisma.transaction.findMany({
        ...query,
        where: {
          id: {
            in: transactionIds,
          },
        },
      });

      await prisma.transactionsOnCategories.deleteMany({
        where: {
          transactionId: { in: transactionIds },
        },
      });

      const transactionAmounts = args.transactions.reduce(
        (amounts, { amount, transaction }) => {
          amounts.set(
            transaction,
            ((amounts.get(transaction) ?? 0) * 100 + Math.abs(amount) * 100) /
              100,
          );

          return amounts;
        },
        new Map<number | string, number>(),
      );

      const updates = transactions.map(({ amount, id }) =>
        prisma.transaction.update({
          data: {
            completed: Math.abs(amount) <= transactionAmounts.get(id)!,
          },
          where: {
            id: id,
          },
        }),
      );

      const inserts = args.transactions.map(
        ({ amount, category, transaction }) =>
          prisma.transactionsOnCategories.create({
            data: {
              amount,
              categoryId: parseId(category)!,
              transactionId: parseIdString(transaction)!,
            },
          }),
      );

      await prisma.$transaction([...inserts, ...updates]);

      return await prisma.transaction.findMany({
        ...query,
        where: {
          id: {
            in: transactionIds,
          },
        },
      });
    },
    type: ["Transaction"],
  }),
}));
