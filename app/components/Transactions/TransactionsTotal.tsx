import { DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useEffect, useMemo } from "react";
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
  const [data, refetch] = useRefetchableFragment(
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
  const transactionsTotal = data.transactionsTotal ?? {
    count: 0,
    income: 0,
    outcome: 0,
  };

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Transactions, () => {
      refetch({ filters }, { fetchPolicy: "network-only" });
    });
  }, [filters, refetch, subscribe]);

  const selectedIncome = useMemo(
    () =>
      selectedTransactions === "all" ||
      selectedTransactions.size === transactionsTotal.count
        ? 0
        : [...selectedTransactions].reduce(
            (sum, { amount, amount_converted: amountConverted }) => {
              const baseAmount = amountConverted ?? amount;
              if (baseAmount > 0) {
                sum += baseAmount;
              }

              return sum;
            },
            0,
          ),
    [selectedTransactions, transactionsTotal.count],
  );

  const selectedSome =
    selectedTransactions !== "all" &&
    selectedTransactions.size > 0 &&
    selectedTransactions.size !== transactionsTotal.count;

  const selectedOutcome = useMemo(
    () =>
      selectedSome
        ? [...selectedTransactions].reduce(
            (sum, { amount, amount_converted: amountConverted }) => {
              const baseAmount = amountConverted ?? amount;
              if (baseAmount < 0) {
                sum += baseAmount;
              }

              return sum;
            },
            0,
          )
        : 0,
    [selectedSome, selectedTransactions],
  );

  return (
    <div className="inline-flex items-center justify-start text-xs">
      <div>
        <Content
          selectedTransactions={selectedTransactions}
          transactionsTotal={transactionsTotal.count}
        />{" "}
        <b>{transactionsTotal.count}</b> transactions
        {transactionsTotal.income > 0 || transactionsTotal.outcome < 0
          ? " for "
          : null}
        {transactionsTotal.income > 0 && (
          <>
            {selectedSome && transactionsTotal.income != selectedIncome ? (
              <>
                <AmountValue
                  amount={selectedIncome}
                  currency={DEFAULT_CURRENCY}
                  size={Size.Small}
                />
                {" of "}
              </>
            ) : null}
            <AmountValue
              amount={transactionsTotal.income}
              currency={DEFAULT_CURRENCY}
              size={Size.Small}
            />
          </>
        )}
        {transactionsTotal.income > 0 && transactionsTotal.outcome < 0
          ? " and "
          : null}
        {transactionsTotal.outcome < 0 && (
          <>
            {selectedSome && transactionsTotal.outcome != selectedOutcome ? (
              <>
                <AmountValue
                  amount={selectedOutcome}
                  currency={DEFAULT_CURRENCY}
                  size={Size.Small}
                />
                {" of "}
              </>
            ) : null}
            <AmountValue
              amount={transactionsTotal.outcome}
              currency={DEFAULT_CURRENCY}
              size={Size.Small}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Content({
  selectedTransactions,
  transactionsTotal,
}: {
  selectedTransactions: TransactionsSelection;
  transactionsTotal: number;
}) {
  if (
    selectedTransactions === "all" ||
    selectedTransactions.size === transactionsTotal
  ) {
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
