import { useState } from "react";
import { graphql, PreloadedQuery, usePreloadedQuery } from "react-relay";

import Filters from "../Filters";
import { useFilters } from "../Filters/FiltersProvider";
import FiltersTransactions from "../Filters/FiltersTransactions";
import { TransactionsQuery as TransactionsQueryType } from "./__generated__/TransactionsQuery.graphql";
import TransactionsTable, { TransactionsSelection } from "./TransactionsTable";

export const TransactionsQuery = graphql`
  query TransactionsQuery(
    $first: Int
    $after: ID
    $filters: FilterTransactionsInput
    $categoryFilters: FilterCategoryInput
  ) {
    ...TransactionsTable
    ...Filters
    ...FiltersTransactions
  }
`;

export default function Transactions({
  preloadedQuery,
}: {
  preloadedQuery: PreloadedQuery<TransactionsQueryType>;
}) {
  const [selectedTransactions, setSelectedTransactions] =
    useState<TransactionsSelection>(new Set([]));

  const { dispatch, filtersState } = useFilters();

  const data = usePreloadedQuery<TransactionsQueryType>(
    TransactionsQuery,
    preloadedQuery,
  );

  return (
    <div className="flex flex-row">
      <div className="basis-3/4 py-3">
        <FiltersTransactions
          data={data}
          dispatch={dispatch}
          filters={filtersState}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />

        <TransactionsTable
          filters={filtersState}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
          transactions={data}
        />
      </div>

      <div className="basis-1/4 p-6">
        <Filters categories data={data} months sources />
      </div>
    </div>
  );
}
