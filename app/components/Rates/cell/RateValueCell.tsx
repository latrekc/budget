import { graphql, useFragment } from "react-relay";
import { RateValueCell$key } from "./__generated__/RateValueCell.graphql";

export default function RateValueCell({
  rate: rate$key,
}: {
  rate: RateValueCell$key;
}) {
  const { rate: value } = useFragment(
    graphql`
      fragment RateValueCell on CurrencyExchangeRate {
        rate
      }
    `,
    rate$key,
  );

  return value?.toFixed(4);
}
