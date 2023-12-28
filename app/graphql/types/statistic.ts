import prisma from "../../lib/prisma";
import { builder } from "../builder";

builder.prismaObject("StatisticPerMonths", {
  fields: (t) => ({
    id: t.exposeID("id"),
    year: t.exposeInt("year"),
    month: t.exposeInt("month"),
    income: t.exposeFloat("income"),
    outcome: t.exposeFloat("outcome"),
  }),
});

builder.queryField("transactions_statistic_per_months", (t) =>
  t.prismaField({
    type: ["StatisticPerMonths"],
    resolve: (query) =>
      prisma.statisticPerMonths.findMany({
        ...query,
      }),
  }),
);

builder.prismaObject("StatisticPerYears", {
  fields: (t) => ({
    id: t.exposeID("id"),
    year: t.exposeInt("year"),
    income: t.exposeFloat("income"),
    outcome: t.exposeFloat("outcome"),
  }),
});

builder.queryField("transactions_statistic_per_years", (t) =>
  t.prismaField({
    type: ["StatisticPerYears"],
    resolve: (query) =>
      prisma.statisticPerYears.findMany({
        ...query,
      }),
  }),
);
