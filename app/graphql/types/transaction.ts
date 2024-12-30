import { Prisma } from "@prisma/client";
import { parse as parseDate } from "date-format-parse";

import prisma, { parseId, parseIdString } from "../../lib/prisma";
import {
  AmountRelation,
  Currency,
  SortBy,
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

builder.enumType(SortBy, {
  name: "SortBy",
});

builder.prismaObject("Transaction", {
  fields: (t) => ({
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
    quantity: t.exposeInt("quantity"),
    source: t.field({
      resolve: (transaction) => enumFromStringValue(Source, transaction.source),
      type: Source,
    }),
  }),
});

builder.prismaObject("TransactionsOnCategories", {
  fields: (t) => ({
    category: t.relation("category"),
    quantity: t.exposeInt("quantity"),
    transaction: t.relation("transaction"),
  }),
});

export type TransactionFilter = {
  amountRelation?: AmountRelation | null;
  categories?: null | string[];
  ignoreCategories?: null | string[];
  months?: null | string[];
  onlyIncome?: boolean | null;
  onlyUncomplited?: boolean | null;
  quantity?: null | string;
  search?: null | string;
  sortBy?: SortBy | null;
  sources?: null | string[];
};

builder.enumType(AmountRelation, {
  name: "AmountRelation",
});
const filterTransactionsInput = builder
  .inputRef<TransactionFilter>("FilterTransactionsInput")
  .implement({
    fields: (t) => ({
      amountRelation: t.field({
        required: false,
        type: AmountRelation,
      }),
      categories: t.stringList({
        required: false,
      }),
      ignoreCategories: t.stringList({
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
      quantity: t.string({
        required: false,
      }),
      search: t.string({
        required: false,
      }),
      sortBy: t.field({
        required: false,
        type: SortBy,
      }),
      sources: t.stringList({
        required: false,
      }),
    }),
  });

async function filtersToWhere(filters: TransactionFilter | null | undefined) {
  let where: Prisma.TransactionWhereInput | undefined = undefined;

  const OR: Prisma.TransactionWhereInput[][] = [];

  if (filters != null) {
    where = {};

    if (filters.onlyUncomplited) {
      where.completed = false;
    }

    if (filters.onlyIncome) {
      where.quantity = {
        gt: 0,
      };
    }

    if ((filters.sources ?? []).length > 0) {
      where.source = {
        in: filters.sources ?? [],
      };
    }

    if ((filters.quantity ?? "").trim().length > 0) {
      const quantity = Math.abs(parseInt((filters.quantity ?? "").trim()));
      switch (filters.amountRelation) {
        case AmountRelation.GREATER:
          OR.push([
            {
              quantity: {
                gt: quantity,
              },
            },
            {
              quantity: {
                lt: -quantity,
              },
            },
          ]);
          break;

        case AmountRelation.LESS:
          where.quantity = {
            gt: -quantity,
            lt: quantity,
          };
          break;

        case AmountRelation.EQUAL:
        default:
          where.quantity = {
            in: [quantity, -quantity],
          };
          break;
      }
    }

    if ((filters.months ?? []).length > 0) {
      OR.push(
        (filters.months ?? []).map((monthId) => {
          const month = parseDate(monthId, "YYYY-MM");
          const nextMonth = new Date(month);
          nextMonth.setMonth(month.getMonth() + 1);

          return {
            date: {
              gte: month,
              lt: nextMonth,
            },
          };
        }),
      );
    }

    let search = filters.search ?? "";
    if (search.length > 0) {
      if (search.startsWith("!")) {
        search = search.slice(1);

        if (search.includes("|")) {
          where.AND = search.split("|").map((keyword) => ({
            description: {
              not: {
                contains: keyword,
              },
            },
          }));
        } else {
          where.NOT = {
            description: {
              contains: search,
            },
          };
        }
      } else if (search.includes("|")) {
        OR.push(
          search.split("|").map((keyword) => ({
            description: {
              contains: keyword,
            },
          })),
        );
      } else {
        where.description = {
          contains: search,
        };
      }
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

    if ((filters.ignoreCategories ?? []).length > 0) {
      const ignoreCategoriesFromFilter: number[] = (
        filters.ignoreCategories ?? []
      ).map((id) => parseId(id)!);

      if (where.categories?.some !== undefined) {
        where.categories = {
          none: {
            categoryId: {
              in: ignoreCategoriesFromFilter,
            },
          },
          some: where.categories.some,
        };
      } else {
        where.categories = {
          none: {
            categoryId: {
              in: ignoreCategoriesFromFilter,
            },
          },
        };
      }
    }

    if (OR.length > 0) {
      where.AND = OR.map((item) => ({ OR: item }));
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
        orderBy:
          args.filters?.sortBy === SortBy.Amount
            ? [{ quantity: "asc" }, { date: "desc" }]
            : [{ date: "desc" }, { quantity: "asc" }],
        where: await filtersToWhere(args.filters),
      });
    },
    type: "Transaction",
  }),
);

const transactionTotal = builder.simpleObject("TransactionTotal", {
  fields: (t) => ({
    count: t.int({
      nullable: false,
    }),
    income: t.int({
      nullable: true,
    }),
    outcome: t.int({
      nullable: true,
    }),
  }),
});

builder.queryField("transactionsTotal", (t) =>
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

      const gt = {
        quantity: {
          gt: 0,
        },
      };
      const lt = {
        quantity: {
          lt: 0,
        },
      };

      const income = await prisma.transaction.aggregate({
        _sum: {
          quantity: true,
        },
        where:
          filters != undefined
            ? {
                AND: [filters, gt],
              }
            : gt,
      });
      const outcome = await prisma.transaction.aggregate({
        _sum: {
          quantity: true,
        },
        where:
          filters != undefined
            ? {
                AND: [filters, lt],
              }
            : lt,
      });

      return {
        count,
        income: income._sum.quantity,
        outcome: outcome._sum.quantity,
      };
    },
    type: transactionTotal,
  }),
);

const updateCategoriesForTransactionsInput = builder
  .inputRef<{
    category: number | string;
    quantity: number;
    transaction: number | string;
  }>("UpdateCategoriesForTransactionsInput")
  .implement({
    fields: (t) => ({
      category: t.id({ required: true }),
      quantity: t.int({ required: true }),
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

      const inserts = transactions.map(({ id: transactionId, quantity }) =>
        prisma.transactionsOnCategories.create({
          data: {
            categoryId,
            quantity,
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
        (quantities, { quantity, transaction }) => {
          quantities.set(
            transaction,
            (quantities.get(transaction) ?? 0) + Math.abs(quantity),
          );

          return quantities;
        },
        new Map<number | string, number>(),
      );

      const updates = transactions.map(({ id, quantity }) =>
        prisma.transaction.update({
          data: {
            completed: Math.abs(quantity) <= transactionAmounts.get(id)!,
          },
          where: {
            id: id,
          },
        }),
      );

      const inserts = args.transactions.map(
        ({ category, quantity, transaction }) =>
          prisma.transactionsOnCategories.create({
            data: {
              categoryId: parseId(category)!,
              quantity,
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
