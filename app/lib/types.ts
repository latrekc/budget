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
  currency: Currency;
  date: Date;
  description: string;
  id: string;
  source: Source;
};

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

export const monthNames = new Map([
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"],
]);

export enum SortBy {
  Amount = "Amount",
  Date = "Date",
}

export function getUTCStartOfDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
  );
}

function getUTCDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getUTCStartOfDateString(date: Date): string {
  return getUTCDateString(getUTCStartOfDate(date));
}
