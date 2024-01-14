import { Dispatch } from "react";
import { graphql, useFragment } from "react-relay";

import { TransactionsFilters$key } from "./__generated__/TransactionsFilters.graphql";
import TransactionCategoriesFilter from "./filter/TransactionCategoriesFilter";
import TransactionComplitedFilter from "./filter/TransactionComplitedFilter";
import TransactionDescriptionFilter from "./filter/TransactionDescriptionFilter";
import TransactionMonthFilter from "./filter/TransactionMonthFilter";
import TransactionSourceFilter from "./filter/TransactionSourceFilter";
import { FiltersState, ReducerAction } from "./TransactionsFiltersReducer";
import { TransactionsSelection } from "./TransactionsTable";
import TransactionsTotal from "./TransactionsTotal";

export default function TransactionsFilters({
  data: data$key,
  dispatch,
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
  data: TransactionsFilters$key;
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const data = useFragment(
    graphql`
      fragment TransactionsFilters on Query {
        ...TransactionsTotal
        ...TransactionCategoriesFilter
      }
    `,
    data$key,
  );

  return (
    <div>
      <div className="m-6">
        <TransactionDescriptionFilter dispatch={dispatch} filters={filters} />
      </div>

      <div className="m-6 flex flex-row flex-wrap gap-x-3">
        <TransactionComplitedFilter dispatch={dispatch} filters={filters} />
        <TransactionSourceFilter dispatch={dispatch} filters={filters} />
        <TransactionMonthFilter dispatch={dispatch} filters={filters} />
        <TransactionCategoriesFilter
          data={data}
          dispatch={dispatch}
          filters={filters}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
        <TransactionsTotal
          data={data}
          filters={filters}
          selectedTransactions={selectedTransactions}
        />
      </div>
    </div>
  );
}
