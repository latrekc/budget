import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import Filters from "../Filters";
import { useFilters } from "../Filters/FiltersProvider";
import FiltersTransactions from "../Filters/FiltersTransactions";
import TransactionsTable, {
  PER_PAGE,
  TransactionsSelection,
} from "./TransactionsTable";
import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";

export default function Transactions() {
  const [selectedTransactions, setSelectedTransactions] =
    useState<TransactionsSelection>(new Set([]));

  const { dispatch, filtersState } = useFilters();

  const data = useLazyLoadQuery<TransactionsQuery>(
    graphql`
      query TransactionsQuery(
        $first: Int
        $after: ID
        $filters: filterTransactionsInput
      ) {
        ...TransactionsTable
        ...Filters
        ...FiltersTransactions
      }
    `,
    { filters: filtersState, first: PER_PAGE },
    { fetchPolicy: "store-and-network" },
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
        <Filters data={data} />
      </div>
    </div>
  );
}
