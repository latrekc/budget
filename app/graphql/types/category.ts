import { Prisma } from "@prisma/client";
import { parse as parseDate } from "date-format-parse";
import { GraphQLResolveInfo } from "graphql";
import prisma, { parseId } from "../../lib/prisma";
import { builder } from "../builder";
import { TransactionFilter } from "./transaction";

async function resolveAmount(
  relation: "income" | "outcome",
  root: {
    id: number;
  },
  info: GraphQLResolveInfo,
) {
  const filters =
    (info.variableValues.categoryFilters as CategoryFilter) ??
    (info.variableValues.filters as TransactionFilter) ??
    (info.variableValues.statisticFilters as TransactionFilter);

  if (relation === "income" && filters?.onlyIncome === true) {
    return 0;
  }

  const where: Prisma.TransactionsOnCategoriesWhereInput = {
    amount: {
      [relation === "income" ? "gt" : "lt"]: 0,
    },
    categoryId: { equals: root.id },
  };

  if (filters?.months != null) {
    where.transaction = {
      OR: filters?.months.map((monthId) => {
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
    };
  }

  const result = await prisma.transactionsOnCategories.aggregate({
    _sum: { amount: true },
    where,
  });

  return result._sum.amount ?? 0;
}

builder.prismaObject("Category", {
  fields: (t) => ({
    id: t.exposeID("id"),
    income: t.int({
      nullable: false,
      resolve: async (root, _args, _context, info) =>
        resolveAmount("income", root, info),
    }),
    name: t.exposeString("name"),
    outcome: t.int({
      nullable: false,
      resolve: async (root, _args, _context, info) =>
        resolveAmount("outcome", root, info),
    }),
    parentCategory: t.relation("parentCategory", {
      nullable: true,
    }),
    subCategories: t.relation("subCategories", {
      query: () => ({
        orderBy: {
          name: "asc",
        },
      }),
    }),
  }),
});

type CategoryFilter = Pick<TransactionFilter, "months" | "onlyIncome">;

const filterCategoriesInput = builder
  .inputRef<CategoryFilter>("FilterCategoryInput")
  .implement({
    fields: (t) => ({
      months: t.stringList({
        required: false,
      }),
      onlyIncome: t.boolean({
        defaultValue: false,
        required: false,
      }),
    }),
  });

builder.queryField("categories", (t) =>
  t.prismaField({
    args: {
      filters: t.arg({
        required: false,
        type: filterCategoriesInput,
      }),
    },
    resolve: (query) =>
      prisma.category.findMany({ ...query, orderBy: [{ name: "asc" }] }),
    type: ["Category"],
  }),
);

async function validateCategoryOrThrow({
  id,
  name,
  parentId,
}: {
  id?: null | number;
  name: string;
  parentId?: null | number;
}) {
  if (parentId != null) {
    const parentExists = await prisma.category.exists({
      id: parentId,
    });

    if (!parentExists) {
      throw new Error(`Parent category ${parentId} does not exist`);
    }
  }

  const params =
    id != null
      ? { id: { not: id }, name: name, parentCategoryId: parentId }
      : {
          name: name,
          parentCategoryId: parentId,
        };
  const categoryExist = await prisma.category.exists(params);

  if (categoryExist) {
    const parent =
      parentId != null
        ? await prisma.category.findFirst({
            where: {
              id: parentId,
            },
          })
        : null;

    throw new Error(
      `Another category ${name} alredy exists in ${
        parent != null ? parent.name : "a root category"
      }`,
    );
  }
}

builder.mutationType({
  fields: (t) => ({
    createCategory: t.prismaField({
      args: {
        name: t.arg.string({ required: true }),
        parent: t.arg.id(),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          name: args.name,
          parentId: parseId(args.parent),
        });

        const category = await prisma.category.create({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: parseId(args.parent),
          },
        });

        return category;
      },
      type: "Category",
    }),
    deleteCategory: t.prismaField({
      args: {
        id: t.arg.id({ required: true }),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        const category = await prisma.category.findFirst({
          where: {
            id: parseId(args.id)!,
          },
        });

        if (category == null) {
          throw new Error(`Category ${args.id} does not exist`);
        }

        await prisma.category.delete({
          ...query,
          where: {
            id: parseId(args.id)!,
          },
        });

        return category;
      },
      type: "Category",
    }),
    updateCategory: t.prismaField({
      args: {
        id: t.arg.id({ required: true }),
        name: t.arg.string({ required: true }),
        parent: t.arg.id(),
      },
      errors: {
        types: [Error],
      },
      resolve: async (query, _root, args) => {
        await validateCategoryOrThrow({
          id: parseId(args.id),
          name: args.name,
          parentId: parseId(args.parent),
        });

        const category = await prisma.category.update({
          ...query,
          data: {
            name: args.name,
            parentCategoryId: parseId(args.parent),
          },
          where: {
            id: parseId(args.id)!,
          },
        });

        return category;
      },
      type: "Category",
    }),
  }),
});
