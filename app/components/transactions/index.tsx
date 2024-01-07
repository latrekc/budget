import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionsCategories from "./TransactionsCategories";
import TransactionsFilters from "./TransactionsFilters";

import { useState } from "react";
import TransactionsStatistic from "./TransactionsStatistic";
import TransactionsTable, {
  PER_PAGE,
  TransactionsSelection,
} from "./TransactionsTable";
import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";
import useFilters from "./useFilters";

export default function Transactions() {
  const [selectedTransactions, setSelectedTransactions] =
    useState<TransactionsSelection>(new Set([]));

  const { filtersState, dispatch } = useFilters();

  const data = useLazyLoadQuery<TransactionsQuery>(
    graphql`
      query TransactionsQuery(
        $first: Int
        $after: ID
        $filters: filterTransactionsInput
      ) {
        ...TransactionsTable
        ...TransactionsStatistic
        ...TransactionsCategories
        ...TransactionsFilters
      }
    `,
    { first: PER_PAGE, filters: filtersState },
  );

  return (
    <>
      <TransactionsFilters
        state={filtersState}
        dispatch={dispatch}
        data={data}
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      />

      <div className="flex flex-row">
        <div className="basis-3/4">
          <TransactionsTable
            transactions={data}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
          />
        </div>

        <div className="basis-1/4">
          <TransactionsCategories categories={data} />
        </div>
      </div>

      <TransactionsStatistic statistic={data} />
    </>
  );
}
