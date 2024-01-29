import { Dispatch } from "react";
import { graphql, useFragment } from "react-relay";

import { FiltersState, ReducerAction } from "./TransactionsFiltersReducer";
import { TransactionsSelection } from "./TransactionsTable";
import TransactionsTotal from "./TransactionsTotal";
import { TransactionsFilters$key } from "./__generated__/TransactionsFilters.graphql";
import TransactionCategoriesFilter from "./filter/TransactionCategoriesFilter";
import TransactionComplitedFilter from "./filter/TransactionComplitedFilter";
import TransactionDescriptionFilter from "./filter/TransactionDescriptionFilter";
import TransactionIncomeFilter from "./filter/TransactionIncomeFilter";

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
        <TransactionIncomeFilter dispatch={dispatch} filters={filters} />
        <TransactionCategoriesFilter
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
