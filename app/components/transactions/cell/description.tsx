import { Transaction } from "@app/lib/types";

export default function TransactionDescriptionCell({
  transaction: { description },
}: {
  transaction: Transaction;
}) {
  return <span className="text-base">{description}</span>;
}
