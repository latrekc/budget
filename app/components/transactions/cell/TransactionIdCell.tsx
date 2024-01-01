import { Snippet } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
import { TransactionIdCell__transaction$key } from "./__generated__/TransactionIdCell__transaction.graphql";
export default function TransactionIdCell({
  transaction: transaction$key,
}: {
  transaction: TransactionIdCell__transaction$key;
}) {
  const { id } = useFragment(
    graphql`
      fragment TransactionIdCell__transaction on Transaction {
        id
      }
    `,
    transaction$key,
  );
  return (
    <Snippet
      hideSymbol
      codeString={id}
      variant="flat"
      size="sm"
      classNames={{ content: "hidden", base: "p-0 gap-0" }}
    />
  );
}