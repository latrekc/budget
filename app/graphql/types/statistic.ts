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
