import { Transaction } from "../../../types";

export default function TransactionDescriptionCell({
  transaction: { description },
}: {
  transaction: Transaction;
}) {
  return <span className="text-base">{description}</span>;
}
