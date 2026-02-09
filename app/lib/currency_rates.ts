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

  return transactions.reduce((result, { currency, date, id }) => {
    if (currency === DEFAULT_CURRENCY) {
      return result.set(id, 1);
    }
    const key = currency + getUTCStartOfDateString(date);
    const rate = exchangeRatesPerDate.get(key);
    if (rate == null) {
      throw new Error(
        `Can't find exchange rate for ${currency} on ${getUTCStartOfDateString(date)}`,
      );
    }
    return result.set(id, rate);
  }, new Map<number | string, number>());
}
