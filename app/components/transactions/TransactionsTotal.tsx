import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useEffect } from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import { TransactionsTotal$key } from "./__generated__/TransactionsTotal.graphql";
import { FiltersState } from "./TransactionsFiltersReducer";
import { TransactionsSelection } from "./TransactionsTable";

export default function TransactionsTotal({
  data: data$key,
  filters,
  selectedTransactions,
}: {
  data: TransactionsTotal$key;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
}) {
  const [{ transactions_total }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsTotal on Query
      @refetchable(queryName: "TransactionsTotalQuery") {
        transactions_total(filters: $filters)
      }
    `,
    data$key,
  );

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Transactions, () => {
      refetch({ filters }, { fetchPolicy: "network-only" });
    });
  }, [filters, refetch, subscribe]);

  return (
    <div className="inline-flex items-center justify-start text-xs">
      <div>
        <Content selectedTransactions={selectedTransactions} />{" "}
        <b>{transactions_total}</b> transactions
      </div>
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
