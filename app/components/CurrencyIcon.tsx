import { Currency } from "@/lib/types";
import {
  PiCurrencyDollarBold,
  PiCurrencyEurBold,
  PiCurrencyGbpBold,
  PiCurrencyRubBold,
} from "react-icons/pi";

export default function CurrencyIcon({ currency }: { currency: Currency }) {
  switch (currency) {
    case Currency.GBP:
      return <PiCurrencyGbpBold />;
    case Currency.EUR:
      return <PiCurrencyEurBold />;
    case Currency.RUB:
      return <PiCurrencyRubBold />;
    case Currency.USD:
      return <PiCurrencyDollarBold />;
  }
}
