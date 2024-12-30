import { Currency } from "./types";

export function convertRate(from: Currency, to: Currency): number {
  switch (to) {
    case Currency.EUR:
    case Currency.RUB:
    case Currency.USD:
      throw new Error(`Undefined exchangion rates for ${to}`);
    case Currency.GBP:
      switch (from) {
        case Currency.GBP:
          return 1;
        case Currency.EUR:
          return 0.83;
        case Currency.USD:
          return 0.8;
        case Currency.RUB:
          return 0.0072;
      }
  }
}
