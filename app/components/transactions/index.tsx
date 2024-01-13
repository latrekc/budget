import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionsCategories from "./TransactionsCategories";
import TransactionsFilters from "./TransactionsFilters";

import { Accordion, AccordionItem } from "@nextui-org/react";
import { useState } from "react";
import TransactionsSources from "./TransactionsSources";
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
    { fetchPolicy: "store-and-network" },
  );

  return (
    <div className="flex flex-row">
      <div className="basis-3/4 py-3">
        <TransactionsFilters
          filters={filtersState}
          dispatch={dispatch}
          data={data}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />

        <TransactionsTable
          filters={filtersState}
          transactions={data}
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
      </div>

      <div className="basis-1/4 p-6">
        <Accordion variant="shadow">
          <AccordionItem key="categories" title="Categories">
            <TransactionsCategories categories={data} />
          </AccordionItem>

          <AccordionItem key="months" title="Months">
            <TransactionsStatistic
              statistic={data}
              filters={filtersState}
              dispatch={dispatch}
            />
          </AccordionItem>
          <AccordionItem key="sources" title="Sources">
            <TransactionsSources filters={filtersState} dispatch={dispatch} />
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
