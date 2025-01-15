import prisma from "./prisma";
import { Currency, getUTCStartOfDate } from "./types";

export async function convertRate(
  from: Currency,
  to: Currency,
  date: Date,
): Promise<number> {
  if (from === to) {
    return 1;
  }

  const correctDate = getUTCStartOfDate(date);

  const id = `${to}-${from}-${correctDate.toISOString()}`;

  const result = await prisma.currencyExchangeRate.findFirst({
    select: {
      rate: true,
    },
    where: {
      id,
    },
  });

  if (result == null) {
    throw new Error(`Undefined exchangion rates for ${id} ${date.valueOf()}`);
  }

  return result.rate;
}
