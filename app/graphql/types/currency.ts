import prisma, { parseIdString } from "../../lib/prisma";
import {
  Currency,
  enumFromStringValue,
  getUTCStartOfDate,
  getUTCStartOfDateString,
} from "../../lib/types";
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

builder.queryField("rates", (t) =>
  t.prismaConnection({
    args: {
      base: t.arg({
        required: true,
        type: Currency,
      }),
      target: t.arg({
        required: true,
        type: Currency,
      }),
    },
    cursor: "id",
    resolve: async (query, _, args) => {
      return await prisma.currencyExchangeRate.findMany({
        ...query,
        orderBy: [{ date: "desc" }, { base: "asc" }, { target: "asc" }],
        where: {
          base: args.base,
          target: args.target,
        },
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

builder.queryField("rate_claims", (t) =>
  t.prismaConnection({
    args: {
      currency: t.arg({
        required: true,
        type: Currency,
      }),
    },
    cursor: "id",
    resolve: async (query, _, args) => {
      return await prisma.currencyExchangeRateClaim.findMany({
        ...query,
        orderBy: [{ currency: "asc" }, { date: "desc" }],
        where: {
          currency: args.currency,
        },
      });
    },
    type: "CurrencyExchangeRateClaim",
  }),
);

builder.mutationFields((t) => ({
  createCurrencyExhangeRate: t.prismaField({
    args: {
      base: t.arg({ required: true, type: Currency }),
      date: t.arg.string({ required: true }),
      target: t.arg({ required: true, type: Currency }),
      value: t.arg.float({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const correctDate = getUTCStartOfDate(new Date(args.date));
      const rate = await prisma.currencyExchangeRate.create({
        ...query,
        data: {
          base: args.base,
          date: correctDate.toISOString(),
          id: `${args.base}-${args.target}-${getUTCStartOfDateString(correctDate)}`,
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
      id: t.arg.id({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, _root, args) => {
      const rate = await prisma.currencyExchangeRate.findFirst({
        where: {
          id: parseIdString(args.id)!,
        },
      });

      if (rate == null) {
        throw new Error(`Exchange rate ${args.id} does not exist`);
      }

      await prisma.currencyExchangeRate.delete({
        ...query,
        where: {
          id: parseIdString(args.id)!,
        },
      });

      return rate;
    },
    type: "CurrencyExchangeRate",
  }),
}));

interface CurrenciesStatistic {
  currency: Currency;
  rateClaims: number;
  rates: number;
}
const CurrenciesStatisticRef = builder.objectRef<CurrenciesStatistic>(
  "CurrenciesStatistic",
);

CurrenciesStatisticRef.implement({
  fields: (t) => ({
    currency: t.field({
      resolve: (rate) => enumFromStringValue(Currency, rate.currency),
      type: Currency,
    }),
    rateClaims: t.exposeInt("rateClaims"),
    rates: t.exposeInt("rates"),
  }),
});

builder.queryField("currencies", (t) =>
  t.field({
    args: {
      base: t.arg({
        required: true,
        type: Currency,
      }),
    },
    resolve: async (_root, args) => {
      return await Promise.all(
        Object.values(Currency)
          .filter((currency) => currency != args.base)
          .map(async (currency) => {
            const rates = await prisma.currencyExchangeRate.count({
              where: {
                base: args.base,
                target: currency,
              },
            });

            const rateClaims = await prisma.currencyExchangeRateClaim.count({
              where: {
                currency: currency,
              },
            });

            return {
              currency,
              rateClaims,
              rates,
            };
          }),
      );
    },
    type: [CurrenciesStatisticRef],
  }),
);
