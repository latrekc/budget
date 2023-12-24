import { format } from "date-format-parse";
import { Transaction } from "../../../../src/types";

export default function TransactionDateCell({
  transaction: { date },
}: {
  transaction: Transaction;
}) {
  return <span className="text-sm">{format(date, "dddd, D MMM YYYY")}</span>;
}
