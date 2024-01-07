import { graphql, useFragment } from "react-relay";
import { TransactionDescriptionCell$key } from "./__generated__/TransactionDescriptionCell.graphql";

export default function TransactionDescriptionCell({
  transaction: transaction$key,
}: {
  transaction: TransactionDescriptionCell$key;
}) {
  const { description } = useFragment(
    graphql`
      fragment TransactionDescriptionCell on Transaction {
        description
      }
    `,
    transaction$key,
  );

  return <span className="text-base">{description}</span>;
}
