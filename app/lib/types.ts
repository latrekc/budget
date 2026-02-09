export enum Source {
  HSBC = "HSBC",
  Monzo = "Monzo",
  Raiffeisen = "Raiffeisen",
  Revolut = "Revolut",
  Sberbank = "Sberbank",
  Tinkoff = "Tinkoff",
  Wise = "Wise",
}

export enum Currency {
  EUR = "EUR",
  GBP = "GBP",
  RUB = "RUB",
  USD = "USD",
}

export const DEFAULT_CURRENCY = Currency.GBP;

export type NonDefaultCurrency = Exclude<Currency, Currency.GBP>;

export type Transaction = {
  amount: number;
  amountConverted: number;
  currency: Currency;
  date: Date;
  description: string;
  id: string;
  source: Source;
};
export type TransactionWithoutAmountConverted = Omit<
  Transaction,
  "amountConverted"
>;

export enum AmountRelation {
  EQUAL = "EQUAL",
  GREATER = "GREATER",
  LESS = "LESS",
}

export function enumFromStringValue<T>(
  enm: { [s: string]: T },
  value: string,
): T {
  if ((Object.values(enm) as unknown as string[]).includes(value)) {
    return value as unknown as T;
  }

  throw new Error(`Undefined value ${value} of ${enm}`);
}

export enum PubSubChannels {
  Categories = "Categories",
  CurrencyExchangeRates = "CurrencyExchangeRates",
  Transactions = "Transactions",
}

export enum SortBy {
  Amount = "Amount",
  Date = "Date",
}
