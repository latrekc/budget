export enum Source {
  HSBC = "HSBC",
  Monzo = "Monzo",
  Raiffeisen = "Raiffeisen",
  Revolut = "Revolut",
  Sberbank = "Sberbank",
  Tinkoff = "Tinkoff",
}

export enum Currency {
  EUR = "EUR",
  GBP = "GBP",
  RUB = "RUB",
  USD = "USD",
}

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
  Transactions = "Transactions",
}
