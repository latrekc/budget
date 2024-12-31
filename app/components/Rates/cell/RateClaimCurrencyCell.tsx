import CurrencyIcon from "@/components/CurrencyIcon";
import { Currency } from "@/lib/types";
import { graphql, useFragment } from "react-relay";
import { RateClaimCurrencyCell$key } from "./__generated__/RateClaimCurrencyCell.graphql";

export default function RateClaimCurrencyCell({
  claim: claim$key,
}: {
  claim: RateClaimCurrencyCell$key;
}) {
  const { currency } = useFragment(
    graphql`
      fragment RateClaimCurrencyCell on CurrencyExchangeRateClaim {
        currency @required(action: THROW)
      }
    `,
    claim$key,
  );

  return <CurrencyIcon currency={currency as Currency} />;
}
