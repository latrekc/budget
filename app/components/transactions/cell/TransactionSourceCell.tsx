import SourceImage from "@/components/SourceImage";
import { graphql, useFragment } from "react-relay";
import { TransactionSourceCell__transaction$key } from "./__generated__/TransactionSourceCell__transaction.graphql";

export default function TransactionSourceCell({
  transaction: transaction$key,
}: {
  transaction: TransactionSourceCell__transaction$key;
}) {
  const { source } = useFragment(
    graphql`
      fragment TransactionSourceCell__transaction on Transaction {
        source
      }
    `,
    transaction$key,
  );
  return <SourceImage source={source} />;
}
