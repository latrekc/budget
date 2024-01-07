import { graphql, useFragment } from "react-relay";
import { TransactionsSelection } from "./TransactionsTable";
import { TransactionsTotal$key } from "./__generated__/TransactionsTotal.graphql";

export default function TransactionsTotal({
  data: data$key,
  selectedTransactions,
}: {
  data: TransactionsTotal$key;
  selectedTransactions: TransactionsSelection;
}) {
  const { transactions_total } = useFragment(
    graphql`
      fragment TransactionsTotal on Query
      @refetchable(queryName: "TransactionsTotalQuery") {
        transactions_total(filters: $filters)
      }
    `,
    data$key,
  );
  return (
    <div className="p-6 pt-0 text-xs">
      <Content selectedTransactions={selectedTransactions} />{" "}
      <b>{transactions_total}</b> transactions
    </div>
  );
}

function Content({
  selectedTransactions,
}: {
  selectedTransactions: TransactionsSelection;
}) {
  if (selectedTransactions === "all") {
    return "Selected all";
  } else if (selectedTransactions instanceof Set) {
    if (selectedTransactions.size > 0) {
      return (
        <>
          Selected <b>{selectedTransactions.size}</b> of
        </>
      );
    } else {
      return "Total";
    }
  }
}
