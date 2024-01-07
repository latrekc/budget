import { format } from "date-format-parse";

import { graphql, useFragment } from "react-relay";
import { TransactionDateCell$key } from "./__generated__/TransactionDateCell.graphql";

export default function TransactionDateCell({
  transaction: transaction$key,
}: {
  transaction: TransactionDateCell$key;
}) {
  const { date } = useFragment(
    graphql`
      fragment TransactionDateCell on Transaction {
        date
      }
    `,
    transaction$key,
  );

  return <span className="text-sm">{format(date, "ddd, D MMM YYYY")}</span>;
}
