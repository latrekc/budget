import prisma from "../../lib/prisma";
import { builder } from "../builder";

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
