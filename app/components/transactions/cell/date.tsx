import { format } from "date-format-parse";
import { Transaction } from "@app/types";

export default function TransactionDateCell({
  transaction: { date },
}: {
  transaction: Transaction;
}) {
  return <span className="text-sm">{format(date, "dddd, D MMM YYYY")}</span>;
}
