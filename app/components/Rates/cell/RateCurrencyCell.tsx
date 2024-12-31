import CurrencyIcon from "@/components/CurrencyIcon";
import { Currency } from "@/lib/types";
import { graphql, useFragment } from "react-relay";
import { RateCurrencyCell$key } from "./__generated__/RateCurrencyCell.graphql";

export default function RateCurrencyCell({
  rate: rate$key,
}: {
  rate: RateCurrencyCell$key;
}) {
  const { target } = useFragment(
    graphql`
      fragment RateCurrencyCell on CurrencyExchangeRate {
        target @required(action: THROW)
      }
    `,
    rate$key,
  );

  return <CurrencyIcon currency={target as Currency} />;
}
