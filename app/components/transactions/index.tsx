import { Accordion, AccordionItem, Badge } from "@nextui-org/react";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";
import TransactionsCategories from "./TransactionsCategories";
import TransactionsFilters from "./TransactionsFilters";
import TransactionsSources from "./TransactionsSources";
import TransactionsStatistic from "./TransactionsStatistic";
import TransactionsTable, {
  PER_PAGE,
  TransactionsSelection,
} from "./TransactionsTable";
import useFilters from "./useFilters";

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
        ...TransactionsStatistic
        ...TransactionsCategories
        ...TransactionsFilters
      }
    `,
    { filters: filtersState, first: PER_PAGE },
    { fetchPolicy: "store-and-network" },
  );

  return (
    <div className="flex flex-row">
      <div className="basis-3/4 py-3">
        <TransactionsFilters
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
        <Accordion defaultSelectedKeys={["categories"]} variant="shadow">
          <AccordionItem
            key="categories"
            title={
              <AccordionItemTitle
                list={[
                  ...(filtersState.categories ?? []),
                  ...(filtersState.ignoreCategories ?? []),
                ]}
                name="Categories"
              />
            }
          >
            <TransactionsCategories
              categories={data}
              dispatch={dispatch}
              filters={filtersState}
            />
          </AccordionItem>

          <AccordionItem
            key="months"
            title={
              <AccordionItemTitle list={filtersState.months} name="Months" />
            }
          >
            <TransactionsStatistic
              dispatch={dispatch}
              filters={filtersState}
              statistic={data}
            />
          </AccordionItem>
          <AccordionItem
            key="sources"
            title={
              <AccordionItemTitle list={filtersState.sources} name="Sources" />
            }
          >
            <TransactionsSources dispatch={dispatch} filters={filtersState} />
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function AccordionItemTitle({
  list,
  name,
}: {
  list: null | readonly string[];
  name: string;
}) {
  return (
    <Badge
      color="primary"
      content={(list ?? []).length > 0 ? list?.length : null}
      placement="top-right"
      shape="rectangle"
      showOutline={false}
      size="sm"
      variant="solid"
    >
      <div className="pr-2">{name}</div>
    </Badge>
  );
}
