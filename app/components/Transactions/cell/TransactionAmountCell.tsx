import AmountValue, { Size } from "@/components/AmountValue";
import { graphql, useFragment } from "react-relay";

import { TransactionAmountCell$key } from "./__generated__/TransactionAmountCell.graphql";

export default function TransactionAmountCell({
  transaction: transaction$key,
}: {
  transaction: TransactionAmountCell$key;
}) {
  const { currency, quantity } = useFragment(
    graphql`
      fragment TransactionAmountCell on Transaction {
        currency @required(action: THROW)
        quantity @required(action: THROW)
      }
    `,
    transaction$key,
  );

  return (
    <AmountValue currency={currency} quantity={quantity} size={Size.Big} />
  );
}
