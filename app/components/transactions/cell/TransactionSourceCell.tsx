import Image from "next/image";
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
  const path = `/assets/sources/${source}.svg`;
  return <Image priority src={path} height={24} width={24} alt={source} />;
}
