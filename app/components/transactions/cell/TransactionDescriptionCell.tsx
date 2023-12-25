import { graphql, useFragment } from "react-relay";
import { TransactionDescriptionCell__transaction$key } from "./__generated__/TransactionDescriptionCell__transaction.graphql";

export default function TransactionDescriptionCell({
  transaction: transaction$key,
}: {
  transaction: TransactionDescriptionCell__transaction$key;
}) {
  const { description } = useFragment(
    graphql`
      fragment TransactionDescriptionCell__transaction on Transaction {
        description
      }
    `,
    transaction$key,
  );

  return <span className="text-base">{description}</span>;
}
