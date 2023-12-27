import AmountValue, { Size } from "@/components/AmountValue";
import { graphql, useFragment } from "react-relay";
import { TransactionAmountCell__transaction$key } from "./__generated__/TransactionAmountCell__transaction.graphql";

export default function TransactionAmountCell({
  transaction: transaction$key,
}: {
  transaction: TransactionAmountCell__transaction$key;
}) {
  const { amount, currency } = useFragment(
    graphql`
      fragment TransactionAmountCell__transaction on Transaction {
        currency
        amount
      }
    `,
    transaction$key,
  );

  return <AmountValue amount={amount} currency={currency} size={Size.Big} />;
}
