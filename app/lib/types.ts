export enum Source {
  Monzo = "Monzo",
  Revolut = "Revolut",
  HSBC = "HSBC",
  Sberbank = "Sberbank",
  Raiffeisen = "Raiffeisen",
  Tinkoff = "Tinkoff",
}

export enum Currency {
  GBP = "GBP",
  EUR = "EUR",
  USD = "USD",
  RUB = "RUB",
}

export type Transaction = {
  id: string;
  source: Source;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
};

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
