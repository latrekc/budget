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
