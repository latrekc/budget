import SourceImage from "@/components/SourceImage";
import { graphql, useFragment } from "react-relay";
import { TransactionSourceCell$key } from "./__generated__/TransactionSourceCell.graphql";

export default function TransactionSourceCell({
  transaction: transaction$key,
}: {
  transaction: TransactionSourceCell$key;
}) {
  const { source } = useFragment(
    graphql`
      fragment TransactionSourceCell on Transaction {
        source
      }
    `,
    transaction$key,
  );
  return <SourceImage source={source} />;
}
