import { graphql, useFragment } from "react-relay";

import { format } from "date-format-parse";
import { RateDateCell$key } from "./__generated__/RateDateCell.graphql";

export default function RateDateCell({
  rate: rate$key,
}: {
  rate: RateDateCell$key;
}) {
  const { date } = useFragment(
    graphql`
      fragment RateDateCell on CurrencyExchangeRate {
        date @required(action: THROW)
      }
    `,
    rate$key,
  );

  return <div className="text-xs">{format(date, "D MMMM YYYY, dddd")}</div>;
}
