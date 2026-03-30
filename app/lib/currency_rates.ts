import { Prisma } from "@prisma/client";
import { getUTCStartOfDate, getUTCStartOfDateString } from "./dates";
import prisma from "./prisma";
import { DEFAULT_CURRENCY, TransactionWithoutAmountConverted } from "./types";

export type TransactionsCurrencyRates = Map<number | string, number>;
export type Transaction =
  Prisma.TransactionGetPayload<Prisma.TransactionDefaultArgs>;

export function getTransactionCurrencyRate(
  currencyRates: TransactionsCurrencyRates,
  transactionId: number | string,
): number {
  const rate = currencyRates.get(transactionId);

  if (rate == null) {
    throw new Error(`Unknown rate of ${transactionId}`);
  }

  return rate;
}

export async function getTransactionsCurrencyRates(
  transactions: Array<Transaction | TransactionWithoutAmountConverted>,
): Promise<TransactionsCurrencyRates> {
  const transactionDates = Array.from(
    new Set(
      transactions.map((transaction) => getUTCStartOfDate(transaction.date)),
    ),
  );

  const exchangeRatesData = await prisma.currencyExchangeRate.findMany({
    where: {
      base: DEFAULT_CURRENCY,
      date: {
        in: transactionDates,
      },
    },
  });

  const exchangeRatesPerDate = exchangeRatesData.reduce(
    (rates, { date, rate, target }) => {
      const key = target + getUTCStartOfDateString(date);
      return rates.set(key, rate);
    },
    new Map<string, number>(),
  );

  const result = transactions.reduce(
    (result, { currency, date, id }) => {
      if (currency === DEFAULT_CURRENCY) {
        result.rates.set(id, 1);
        return result;
      }
      const key = currency + getUTCStartOfDateString(date);
      const rate = exchangeRatesPerDate.get(key);
      if (rate == null) {
        result.errors.add(`${currency} on ${getUTCStartOfDateString(date)}`);
        return result;
      }
      result.rates.set(id, rate);
      return result;
    },
    { errors: new Set<string>(), rates: new Map<number | string, number>() },
  );

  if (result.errors != null && result.errors.size > 0) {
    throw new Error(
      `Can't find exchange rate for: ${Array.from(result.errors).sort().join("\n")}`,
    );
  }

  return result.rates;
}
