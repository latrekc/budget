import { format } from "date-format-parse";

import { graphql, useFragment } from "react-relay";
import { TransactionDateCell__transaction$key } from "./__generated__/TransactionDateCell__transaction.graphql";

export default function TransactionDateCell({
  transaction: transaction$key,
}: {
  transaction: TransactionDateCell__transaction$key;
}) {
  const { date } = useFragment(
    graphql`
      fragment TransactionDateCell__transaction on Transaction {
        date
      }
    `,
    transaction$key,
  );

  return <span className="text-sm">{format(date, "ddd, D MMM YYYY")}</span>;
}
