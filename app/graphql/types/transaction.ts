import { Prisma } from "@prisma/client";
import { parse as parseDate } from "date-format-parse";

import prisma, { parseId, parseIdString } from "../../lib/prisma";
import {
  AmountRelation,
  Currency,
  Source,
  enumFromStringValue,
} from "../../lib/types";
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
  amount?: null | string;
  amountRelation?: AmountRelation | null;
  categories?: null | string[];
  months?: null | string[];
  onlyIncome?: boolean | null;
  onlyUncomplited?: boolean | null;
  search?: null | string;
  sources?: null | string[];
};

builder.enumType(AmountRelation, {
  name: "AmountRelation",
});
const filterTransactionsInput = builder
  .inputRef<TransactionFilter>("filterTransactionsInput")
  .implement({
    fields: (t) => ({
      amount: t.string({
        required: false,
      }),
      amountRelation: t.field({
        required: false,
        type: AmountRelation,
      }),
      categories: t.stringList({
        required: false,
      }),
      months: t.stringList({
        required: false,
      }),
      onlyIncome: t.boolean({
        defaultValue: false,
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

async function filtersToWhere(filters: TransactionFilter | null | undefined) {
  let where: Prisma.TransactionWhereInput | undefined = undefined;

  if (filters != null) {
    where = {};

    if (filters.onlyUncomplited) {
      where.completed = false;
    }

    if (filters.onlyIncome) {
      where.amount = {
        gt: 0,
      };
    }

    if ((filters.sources ?? []).length > 0) {
      where.source = {
        in: filters.sources ?? [],
      };
    }

    if ((filters.amount ?? "").trim().length > 0) {
      const amount = parseFloat((filters.amount ?? "").trim());
      switch (filters.amountRelation) {
        case AmountRelation.GREATER:
          where.OR = [
            {
              amount: {
                gt: Math.abs(amount),
              },
            },
            {
              amount: {
                lt: -Math.abs(amount),
              },
            },
          ];
          break;

        case AmountRelation.LESS:
          where.OR = [
            {
              amount: {
                gte: 0,
                lt: Math.abs(amount),
              },
            },
            {
              amount: {
                gt: -Math.abs(amount),
                lte: 0,
              },
            },
          ];
          break;

        case AmountRelation.EQUAL:
        default:
          where.amount = {
            in: [Math.abs(amount), -Math.abs(amount)],
          };
          break;
      }
    }

    if ((filters.months ?? []).length > 0) {
      where.OR = (filters.months ?? []).map((monthId) => {
        const month = parseDate(monthId, "YYYY-MM");
        const nextMonth = new Date(month);
        nextMonth.setMonth(month.getMonth() + 1);

        return {
          date: {
            gte: month,
            lt: nextMonth,
          },
        };
      });
    }

    if ((filters.search ?? "").length > 0) {
      where.description = {
        contains: filters.search ?? "",
      };
    }

    if ((filters.categories ?? []).length > 0) {
      const categoriesFromFilter: number[] = (filters.categories ?? []).map(
        (id) => parseId(id)!,
      );

      const categoriesWithSubCategories = await prisma.category.findMany({
        select: {
          id: true,
        },
        where: {
          OR: [
            {
              id: {
                in: categoriesFromFilter,
              },
            },
            {
              parentCategoryId: {
                in: categoriesFromFilter,
              },
            },
            {
              parentCategory: {
                parentCategoryId: {
                  in: categoriesFromFilter,
                },
              },
            },
          ],
        },
      });

      where.categories = {
        some: {
          categoryId: {
            in: categoriesWithSubCategories.map(({ id }) => id),
          },
        },
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
        where: await filtersToWhere(args.filters),
      });
    },
    type: "Transaction",
  }),
);

const TransactionTotal = builder.simpleObject("TransactionTotal", {
  fields: (t) => ({
    count: t.int({
      nullable: false,
    }),
    income: t.float({
      nullable: true,
    }),
    outcome: t.float({
      nullable: true,
    }),
  }),
});

builder.queryField("transactions_total", (t) =>
  t.field({
    args: {
      filters: t.arg({
        required: false,
        type: filterTransactionsInput,
      }),
    },
    resolve: async (_, args) => {
      const filters = await filtersToWhere(args.filters);
      const count = await prisma.transaction.count({
        where: filters,
      });

      const income = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ...filters,
          amount: {
            gt: 0,
          },
        },
      });
      const outcome = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ...filters,
          amount: {
            lt: 0,
          },
        },
      });

      return {
        count,
        income: income._sum.amount,
        outcome: outcome._sum.amount,
      };
    },
    type: TransactionTotal,
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
        where: await filtersToWhere(args.filters),
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
