import { Currency, PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useEffect } from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import AmountValue, { Size } from "../AmountValue";
import { FiltersState } from "../Filters/FiltersReducer";
import { TransactionsSelection } from "./TransactionsTable";
import { TransactionsTotal$key } from "./__generated__/TransactionsTotal.graphql";

export default function TransactionsTotal({
  data: data$key,
  filters,
  selectedTransactions,
}: {
  data: TransactionsTotal$key;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
}) {
  const [{ transactionsTotal }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsTotal on Query
      @refetchable(queryName: "TransactionsTotalQuery") {
        transactionsTotal(filters: $filters) {
          count
          income
          outcome
        }
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
        <b>{transactionsTotal?.count}</b> transactions
        {(transactionsTotal?.income ?? 0) > 0 ||
        (transactionsTotal?.outcome ?? 0) < 0
          ? " for "
          : null}
        {(transactionsTotal?.income ?? 0) > 0 && (
          <AmountValue
            amount={transactionsTotal?.income ?? 0}
            currency={Currency.GBP}
            size={Size.Small}
          />
        )}
        {(transactionsTotal?.income ?? 0) > 0 &&
        (transactionsTotal?.outcome ?? 0) < 0
          ? " and "
          : null}
        {(transactionsTotal?.outcome ?? 0) < 0 && (
          <AmountValue
            amount={transactionsTotal?.outcome ?? 0}
            currency={Currency.GBP}
            size={Size.Small}
          />
        )}
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
