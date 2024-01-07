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
    completed: t.exposeBoolean("completed"),
  }),
});

builder.prismaObject("TransactionsOnCategories", {
  fields: (t) => ({
    transaction: t.relation("transaction"),
    category: t.relation("category"),
    amount: t.exposeFloat("amount"),
  }),
});

type TransactionFilter = {
  onlyUncomplited?: boolean | null;
  sources?: string[] | null;
  month?: string | null;
  search?: string | null;
};

const filterTransactionsInput = builder
  .inputRef<TransactionFilter>("filterTransactionsInput")
  .implement({
    fields: (t) => ({
      onlyUncomplited: t.boolean({
        required: false,
        defaultValue: false,
      }),
      sources: t.stringList({
        required: false,
      }),
      month: t.string({
        required: false,
      }),
      search: t.string({
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
    type: "Transaction",
    cursor: "id",
    args: {
      filters: t.arg({
        type: filterTransactionsInput,
        required: false,
      }),
    },
    resolve: async (query, _, args) => {
      return await prisma.transaction.findMany({
        ...query,
        orderBy: [{ date: "desc" }],
        where: filtersToWhere(args.filters),
      });
    },
  }),
);

builder.queryField("transactions_total", (t) =>
  t.int({
    args: {
      filters: t.arg({
        type: filterTransactionsInput,
        required: false,
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
      amount: t.float({ required: true }),
    }),
  });

builder.mutationFields((t) => ({
  deleteCategoriesForTransactions: t.prismaField({
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

      const deletes = args.transactions.map(({ transaction, category }) =>
        prisma.transactionsOnCategories.delete({
          where: {
            transactionId_categoryId: {
              transactionId: parseIdString(transaction)!,
              categoryId: parseId(category)!,
            },
          },
        }),
      );

      await prisma.$transaction([...deletes]);

      await prisma.transaction.updateMany({
        where: {
          id: {
            in: transactionIds,
          },
        },
        data: {
          completed: false,
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
  }),

  updateCategoriesForAllTransactions: t.prismaField({
    type: ["Transaction"],
    args: {
      category: t.arg.string({
        required: true,
      }),
      filters: t.arg({
        type: filterTransactionsInput,
        required: true,
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
        where: {
          id: {
            in: transactionIds,
          },
        },
        data: {
          completed: true,
        },
      });

      const categoryId = parseId(args.category)!;

      const inserts = transactions.map(({ id: transactionId, amount }) =>
        prisma.transactionsOnCategories.create({
          data: {
            categoryId,
            transactionId,
            amount,
          },
        }),
      );

      await prisma.$transaction([...inserts]);

      return [];
    },
  }),

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
        (amounts, { transaction, amount }) => {
          amounts.set(
            transaction,
            ((amounts.get(transaction) ?? 0) * 100 + Math.abs(amount) * 100) /
              100,
          );

          return amounts;
        },
        new Map<string | number, number>(),
      );

      const updates = transactions.map(({ id, amount }) =>
        prisma.transaction.update({
          where: {
            id: id,
          },
          data: {
            completed: Math.abs(amount) <= transactionAmounts.get(id)!,
          },
        }),
      );

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
  }),
}));
