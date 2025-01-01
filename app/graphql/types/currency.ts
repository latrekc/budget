import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { Currency, enumFromStringValue } from "../../lib/types";
import { builder } from "../builder";

builder.prismaObject("CurrencyExchangeRate", {
  fields: (t) => ({
    base: t.field({
      resolve: (rate) => enumFromStringValue(Currency, rate.base),
      type: Currency,
    }),
    date: t.field({
      resolve: (transaction) => transaction.date,
      type: "Date",
    }),
    id: t.exposeID("id"),
    rate: t.exposeFloat("rate"),
    target: t.field({
      resolve: (rate) => enumFromStringValue(Currency, rate.target),
      type: Currency,
    }),
  }),
});

export type RatesFilter = {
  base?: null | string[];
  target?: null | string[];
};
const filterRatesInput = builder
  .inputRef<RatesFilter>("FilterRatesInput")
  .implement({
    fields: (t) => ({
      base: t.stringList({
        required: false,
      }),
      target: t.stringList({
        required: false,
      }),
    }),
  });

async function filtersToWhere(filters: RatesFilter | null | undefined) {
  let where: Prisma.CurrencyExchangeRateWhereInput | undefined = undefined;

  if (filters != null) {
    where = {};

    if ((filters.base ?? []).length > 0) {
      where.base = {
        in: filters.base ?? [],
      };
    }

    if ((filters.target ?? []).length > 0) {
      where.target = {
        in: filters.target ?? [],
      };
    }
  }

  return where;
}

builder.queryField("rates", (t) =>
  t.prismaConnection({
    args: {
      filters: t.arg({
        required: false,
        type: filterRatesInput,
      }),
    },
    cursor: "id",
    resolve: async (query, _, args) => {
      return await prisma.currencyExchangeRate.findMany({
        ...query,
        orderBy: [{ date: "desc" }, { base: "asc" }, { target: "asc" }],
        where: await filtersToWhere(args.filters),
      });
    },
    type: "CurrencyExchangeRate",
  }),
);

builder.prismaObject("CurrencyExchangeRateClaim", {
  fields: (t) => ({
    currency: t.field({
      resolve: (rate) => enumFromStringValue(Currency, rate.currency),
      type: Currency,
    }),
    date: t.field({
      resolve: (transaction) => transaction.date,
      type: "Date",
    }),
    id: t.exposeID("id"),
  }),
});

export type RateClaimsFilter = {
  currency: string;
};
const filterRateClaimsInput = builder
  .inputRef<RateClaimsFilter>("FilterRateClaimsInput")
  .implement({
    fields: (t) => ({
      currency: t.string({
        required: true,
      }),
    }),
  });

builder.queryField("rate_claims", (t) =>
  t.prismaConnection({
    args: {
      filters: t.arg({
        required: true,
        type: filterRateClaimsInput,
      }),
    },
    cursor: "id",
    resolve: async (query, _, args) => {
      return await prisma.currencyExchangeRateClaim.findMany({
        ...query,
        orderBy: [{ currency: "asc" }, { date: "desc" }],
        where: {
          currency: {
            not: args.filters.currency,
          },
        },
      });
    },
    type: "CurrencyExchangeRateClaim",
  }),
);

builder.mutationFields((t) => ({
  createCurrencyExhangeRate: t.prismaField({
    args: {
      base: t.arg.string({ required: true }),
      date: t.arg.string({ required: true }),
      target: t.arg.string({ required: true }),
      value: t.arg.float({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const rate = await prisma.currencyExchangeRate.create({
        ...query,
        data: {
          base: args.base,
          date: args.date,
          id: `${args.base}-${args.target}-${args.date}`,
          rate: args.value,
          target: args.target,
        },
      });

      return rate;
    },
    type: "CurrencyExchangeRate",
  }),
  deleteCurrencyExhangeRate: t.prismaField({
    args: {
      id: t.arg.string({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const rate = await prisma.currencyExchangeRate.findFirst({
        where: {
          id: args.id,
        },
      });

      if (rate == null) {
        throw new Error(`Exchange rate ${args.id} does not exist`);
      }

      await prisma.currencyExchangeRate.delete({
        ...query,
        where: {
          id: args.id,
        },
      });

      return rate;
    },
    type: "CurrencyExchangeRate",
  }),
}));
