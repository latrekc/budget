import { graphql, useFragment } from "react-relay";

import { format } from "date-format-parse";
import { RateClaimDateCell$key } from "./__generated__/RateClaimDateCell.graphql";

export default function RateClaimDateCell({
  claim: claim$key,
}: {
  claim: RateClaimDateCell$key;
}) {
  const { date } = useFragment(
    graphql`
      fragment RateClaimDateCell on CurrencyExchangeRateClaim {
        date @required(action: THROW)
      }
    `,
    claim$key,
  );

  return <div className="text-xs">{format(date, "D MMMM YYYY, dddd")}</div>;
}
