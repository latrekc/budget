import { Transaction } from "@app/lib/types";
import { format } from "date-format-parse";

export default function TransactionDateCell({
  transaction: { date },
}: {
  transaction: Transaction;
}) {
  return <span className="text-sm">{format(date, "dddd, D MMM YYYY")}</span>;
}
