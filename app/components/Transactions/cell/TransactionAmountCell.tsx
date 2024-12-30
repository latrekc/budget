import AmountValue, { Size } from "@/components/AmountValue";
import { graphql, useFragment } from "react-relay";

import { DEFAULT_CURRENCY } from "@/lib/types";
import { TransactionAmountCell$key } from "./__generated__/TransactionAmountCell.graphql";

export default function TransactionAmountCell({
  transaction: transaction$key,
}: {
  transaction: TransactionAmountCell$key;
}) {
  const {
    amount,
    amount_converted: amountConverted,
    currency,
  } = useFragment(
    graphql`
      fragment TransactionAmountCell on Transaction {
        currency @required(action: THROW)
        amount @required(action: THROW)
        amount_converted @required(action: THROW)
      }
    `,
    transaction$key,
  );

  return (
    <>
      <AmountValue amount={amount} currency={currency} size={Size.Big} />
      {currency !== DEFAULT_CURRENCY ? (
        <div>
          <AmountValue
            amount={amountConverted}
            currency={DEFAULT_CURRENCY}
            secondary
            size={Size.Small}
          />
        </div>
      ) : null}
    </>
  );
}
