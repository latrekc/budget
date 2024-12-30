import { Dispatch } from "react";
import { graphql, useFragment } from "react-relay";

import { TransactionsSelection } from "../Transactions/TransactionsTable";
import TransactionsTotal from "../Transactions/TransactionsTotal";
import { FiltersReducerAction, FiltersState } from "./FiltersReducer";
import { FiltersTransactions$key } from "./__generated__/FiltersTransactions.graphql";
import AmountFilter from "./filter/AmountFilter";
import CategoriesFilter from "./filter/CategoriesFilter";
import ComplitedFilter from "./filter/ComplitedFilter";
import CurrencyFilter from "./filter/CurrencyFilter";
import DescriptionFilter from "./filter/DescriptionFilter";
import IncomeFilter from "./filter/IncomeFilter";
import SortFilter from "./filter/SortFilter";

export default function FiltersTransactions({
  data: data$key,
  dispatch,
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
  data: FiltersTransactions$key;
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const data = useFragment(
    graphql`
      fragment FiltersTransactions on Query {
        ...TransactionsTotal
        ...CategoriesFilter_Categories
      }
    `,
    data$key,
  );

  return (
    <div>
      <div className="row-auto m-6 flex">
        <DescriptionFilter dispatch={dispatch} filters={filters} />
        <AmountFilter dispatch={dispatch} filters={filters} />
      </div>

      <div className="m-6 flex flex-row flex-wrap gap-x-3">
        <ComplitedFilter dispatch={dispatch} filters={filters} />
        <IncomeFilter dispatch={dispatch} filters={filters} />
        <SortFilter dispatch={dispatch} filters={filters} />
        <CurrencyFilter dispatch={dispatch} filters={filters} />
      </div>
      <div className="m-6 flex flex-row flex-wrap gap-x-3">
        <TransactionsTotal
          data={data}
          filters={filters}
          selectedTransactions={selectedTransactions}
        />
        <CategoriesFilter
          categories={data}
          filters={filters}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      </div>
    </div>
  );
}
