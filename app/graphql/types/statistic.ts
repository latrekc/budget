import { Prisma } from "@prisma/client";

import prisma, { parseId } from "../../lib/prisma";
import { enumFromStringValue, Source } from "../../lib/types";
import { builder } from "../builder";

builder.prismaObject("Statistic", {
  fields: (t) => ({
    category: t.relation("category"),
    id: t.exposeID("id"),
    income: t.exposeFloat("income"),
    monthId: t.exposeString("monthId"),
    outcome: t.exposeFloat("outcome"),
  }),
});

type StatisticFilter = {
  categories?: null | string[];
  ignoreCategories?: null | string[];
  months?: null | string[];
  onlyIncome?: boolean | null;
};

const filterStatisticInput = builder
  .inputRef<StatisticFilter>("FilterStatisticInput")
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

async function categoriesWithSubCategories(
  categoriesFromFilter: null | string[] | undefined,
) {
  const ids = (categoriesFromFilter ?? []).map((id) => parseId(id)!);

  const records = await prisma.category.findMany({
    select: {
      id: true,
    },
    where: {
      OR: [
        {
          id: {
            in: ids,
          },
        },
        {
          parentCategoryId: {
            in: ids,
          },
        },
        {
          parentCategory: {
            parentCategoryId: {
              in: ids,
            },
          },
        },
      ],
    },
  });
  return records.map(({ id }) => id);
}

async function filtersToWhere(filters: StatisticFilter | null | undefined) {
  let where: Prisma.StatisticWhereInput | undefined = undefined;

  if (filters != null) {
    where = {};

    if (filters.onlyIncome) {
      where.income = {
        gt: 0,
      };
    } else {
      where.OR = [{ income: { gt: 0 } }, { outcome: { lt: 0 } }];
    }

    if ((filters.months ?? []).length > 0) {
      where.monthId = { in: filters.months ?? [] };
    }

    let categoryIds: number[] | undefined = undefined;

    if ((filters.categories ?? []).length > 0) {
      categoryIds = await categoriesWithSubCategories(filters.categories);

      where.categoryId = {
        in: categoryIds,
      };
    }

    if ((filters.ignoreCategories ?? []).length > 0) {
      const ignoreCategoryIds = await categoriesWithSubCategories(
        filters.ignoreCategories,
      );

      if (categoryIds !== undefined) {
        where.categoryId = {
          in: categoryIds,
          notIn: ignoreCategoryIds,
        };
      } else {
        where.categoryId = {
          notIn: ignoreCategoryIds,
        };
      }
    }
  }

  return where;
}

builder.queryField("transactionsStatistic", (t) =>
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
        orderBy: [{ monthId: "asc" }],
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

builder.queryField("transactionsStatisticPerMonths", (t) =>
  t.prismaField({
    resolve: (query) =>
      prisma.statisticPerMonths.findMany({
        ...query,
      }),
    type: ["StatisticPerMonths"],
  }),
);

builder.prismaObject("StatisticPerSource", {
  fields: (t) => ({
    id: t.exposeID("id"),
    income: t.exposeFloat("income"),
    outcome: t.exposeFloat("outcome"),
    source: t.field({
      resolve: (transaction) => enumFromStringValue(Source, transaction.source),
      type: Source,
    }),
  }),
});

builder.queryField("transactionsStatisticPerSource", (t) =>
  t.prismaField({
    resolve: () => prisma.statisticPerSource.findMany(),
    type: ["StatisticPerSource"],
  }),
);
