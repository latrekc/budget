import { Prisma } from "@prisma/client";

import prisma, { parseId } from "../../lib/prisma";
import { builder } from "../builder";

builder.prismaObject("Statistic", {
  fields: (t) => ({
    category: t.relation("category"),
    id: t.exposeID("id"),
    income: t.exposeFloat("income"),
    month: t.exposeInt("month"),
    outcome: t.exposeFloat("outcome"),
    year: t.exposeInt("year"),
  }),
});

type StatisticFilter = {
  categories?: null | string[];
  ignoreCategories?: null | string[];
  months?: null | string[];
  onlyIncome?: boolean | null;
};

const filterStatisticInput = builder
  .inputRef<StatisticFilter>("filterStatisticInput")
  .implement({
    fields: (t) => ({
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
    }),
  });

async function filtersToWhere(filters: StatisticFilter | null | undefined) {
  let where: Prisma.StatisticWhereInput | undefined = undefined;

  const OR: Prisma.StatisticWhereInput[][] = [];

  if (filters != null) {
    where = {};

    if (filters.onlyIncome) {
      where.income = {
        gt: 0,
      };
    }

    if ((filters.months ?? []).length > 0) {
      OR.push(
        (filters.months ?? []).map((monthId) => {
          const [year, month] = monthId.split("-").map(parseInt);

          return {
            month: {
              equals: month,
            },
            year: {
              equals: year,
            },
          };
        }),
      );
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

      where.categoryId = {
        in: categoriesWithSubCategories.map(({ id }) => id),
      };
    }

    if ((filters.ignoreCategories ?? []).length > 0) {
      const ignoreCategoriesFromFilter: number[] = (
        filters.ignoreCategories ?? []
      ).map((id) => parseId(id)!);

      if (
        where.categoryId !== undefined &&
        typeof where.categoryId !== "number" &&
        where.categoryId.in !== undefined
      ) {
        where.categoryId = {
          in: where.categoryId.in,
          notIn: ignoreCategoriesFromFilter,
        };
      } else {
        where.categoryId = {
          notIn: ignoreCategoriesFromFilter,
        };
      }
    }

    if (OR.length > 0) {
      where.AND = OR.map((item) => ({ OR: item }));
    }
  }

  return where;
}

builder.queryField("transactions_statistic", (t) =>
  t.prismaField({
    args: {
      filters: t.arg({
        required: false,
        type: filterStatisticInput,
      }),
    },
    resolve: async (query, _, args) => {
      return prisma.statistic.findMany({
        ...query,
        orderBy: [{ year: "desc" }, { month: "desc" }],
        where: await filtersToWhere(args.filters),
      });
    },
    type: ["Statistic"],
  }),
);

builder.prismaObject("StatisticPerMonths", {
  fields: (t) => ({
    id: t.exposeID("id"),
    income: t.exposeFloat("income"),
    month: t.exposeInt("month"),
    outcome: t.exposeFloat("outcome"),
    year: t.exposeInt("year"),
  }),
});

builder.queryField("transactions_statistic_per_months", (t) =>
  t.prismaField({
    resolve: (query) =>
      prisma.statisticPerMonths.findMany({
        ...query,
      }),
    type: ["StatisticPerMonths"],
  }),
);

builder.prismaObject("StatisticPerYears", {
  fields: (t) => ({
    id: t.exposeID("id"),
    income: t.exposeFloat("income"),
    outcome: t.exposeFloat("outcome"),
    year: t.exposeInt("year"),
  }),
});

builder.queryField("transactions_statistic_per_years", (t) =>
  t.prismaField({
    resolve: (query) =>
      prisma.statisticPerYears.findMany({
        ...query,
      }),
    type: ["StatisticPerYears"],
  }),
);
