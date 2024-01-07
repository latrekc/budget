import { Dispatch, useCallback, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ReducerAction, ReducerState } from "./TransactionsFiltersReducer";
import { TransactionsSelection } from "./TransactionsTable";
import TransactionsTotal from "./TransactionsTotal";
import { TransactionsFilters$key } from "./__generated__/TransactionsFilters.graphql";
import TransactionSetCategoryButton from "./buttons/TransactionSetCategoryButton";
import TransactionComplitedFilter from "./filter/TransactionComplitedFilter";
import TransactionDescriptionFilter from "./filter/TransactionDescriptionFilter";
import TransactionMonthFilter from "./filter/TransactionMonthFilter";
import TransactionSourceFilter from "./filter/TransactionSourceFilter";

export default function TransactionsFilters({
  state,
  dispatch,
  data: data$key,
  selectedTransactions,
  setSelectedTransactions,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
  data: TransactionsFilters$key;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const data = useFragment(
    graphql`
      fragment TransactionsFilters on Query {
        ...TransactionMonthFilter
        ...TransactionsTotal
      }
    `,
    data$key,
  );

  const transactions = useMemo(() => {
    if (selectedTransactions === "all") {
      return "all";
    }

    if (selectedTransactions instanceof Set) {
      return [...selectedTransactions.values()];
    }
    return [];
  }, [selectedTransactions]);

  const onSetCategories = useCallback(
    () => setSelectedTransactions(new Set()),
    [],
  );

  return (
    <div>
      <div className="flex flex-row flex-wrap gap-x-6 p-6">
        <TransactionComplitedFilter dispatch={dispatch} state={state} />
        <TransactionDescriptionFilter dispatch={dispatch} state={state} />
        <TransactionSourceFilter dispatch={dispatch} state={state} />
        <TransactionMonthFilter
          dispatch={dispatch}
          state={state}
          months={data}
        />
        <TransactionSetCategoryButton
          onCompleted={onSetCategories}
          transactions={transactions}
          state={state}
        />
      </div>

      <TransactionsTotal
        data={data}
        selectedTransactions={selectedTransactions}
      />
    </div>
  );
}
