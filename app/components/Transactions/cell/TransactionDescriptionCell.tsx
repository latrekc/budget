import { graphql, useFragment } from "react-relay";

import { format } from "date-format-parse";
import { TransactionDescriptionCell$key } from "./__generated__/TransactionDescriptionCell.graphql";

export default function TransactionDescriptionCell({
  transaction: transaction$key,
}: {
  transaction: TransactionDescriptionCell$key;
}) {
  const { date, description } = useFragment(
    graphql`
      fragment TransactionDescriptionCell on Transaction {
        date
        description
      }
    `,
    transaction$key,
  );

  return (
    <>
      <div className="select-all text-base">{description}</div>
      <div className="text-xs">{format(date, "D MMMM YYYY, dddd")}</div>
    </>
  );
}
