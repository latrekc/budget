import { Dispatch } from "react";
import { graphql, useFragment } from "react-relay";
import { ReducerAction, ReducerState } from "./TransactionsFiltersReducer";
import { TransactionsFilters$key } from "./__generated__/TransactionsFilters.graphql";
import TransactionComplitedFilter from "./filter/TransactionComplitedFilter";
import TransactionDescriptionFilter from "./filter/TransactionDescriptionFilter";
import TransactionMonthFilter from "./filter/TransactionMonthFilter";
import TransactionSourceFilter from "./filter/TransactionSourceFilter";

export default function TransactionsFilters({
  state,
  dispatch,
  months: months$key,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
  months: TransactionsFilters$key;
}) {
  const months = useFragment(
    graphql`
      fragment TransactionsFilters on Query {
        ...TransactionMonthFilter
      }
    `,
    months$key,
  );

  return (
    <div className="flex flex-row flex-wrap gap-x-6 p-6">
      <TransactionComplitedFilter dispatch={dispatch} state={state} />
      <TransactionDescriptionFilter dispatch={dispatch} state={state} />
      <TransactionSourceFilter dispatch={dispatch} state={state} />
      <TransactionMonthFilter
        dispatch={dispatch}
        state={state}
        months={months}
      />
    </div>
  );
}
