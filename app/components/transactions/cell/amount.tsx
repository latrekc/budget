import { Transaction } from "../../../../src/types";

export default function TransactionAmountCell({
  transaction: { amount, currency },
}: {
  transaction: Transaction;
}) {
  return (
    <span className={`${amount > 0 ? "text-green-900" : ""} text-mono text-lg`}>
      {new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
      }).format(amount)}
    </span>
  );
}
