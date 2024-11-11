import AmountValue, { Size } from "@/components/AmountValue";
import { graphql, useFragment } from "react-relay";

import { TransactionAmountCell$key } from "./__generated__/TransactionAmountCell.graphql";

export default function TransactionAmountCell({
  transaction: transaction$key,
}: {
  transaction: TransactionAmountCell$key;
}) {
  const { amount, currency } = useFragment(
    graphql`
      fragment TransactionAmountCell on Transaction {
        currency @required(action: THROW)
        amount @required(action: THROW)
      }
    `,
    transaction$key,
  );

  return <AmountValue amount={amount} currency={currency} size={Size.Big} />;
}
