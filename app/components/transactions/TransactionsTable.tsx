"use client";

import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import {
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useCallback, useEffect, useMemo } from "react";
import { graphql, useFragment, usePaginationFragment } from "react-relay";

import { FiltersState } from "./TransactionsFiltersReducer";
import { TransactionsTable$key } from "./__generated__/TransactionsTable.graphql";
import { TransactionsTable__RenderCell$key } from "./__generated__/TransactionsTable__RenderCell.graphql";
import TransactionAmountCell from "./cell/TransactionAmountCell";
import TransactionCategoriesButtonCell from "./cell/TransactionCategoriesButtonCell";
import TransactionCategoriesCell from "./cell/TransactionCategoriesCell";
import TransactionDateCell from "./cell/TransactionDateCell";
import TransactionDescriptionCell from "./cell/TransactionDescriptionCell";
import TransactionSourceCell from "./cell/TransactionSourceCell";

enum Colunms {
  "Source" = "Source",
  // eslint-disable-next-line perfectionist/sort-enums
  "Date" = "Date",
  "Description" = "Description",
  // eslint-disable-next-line perfectionist/sort-enums
  "Categories" = "Categories",
  "CategoriesButton" = "",
  // eslint-disable-next-line perfectionist/sort-enums
  "Amount" = "Amount",
}

export const PER_PAGE = 20;

export type TransactionsSelection =
  | "all"
  | Set<{
      amount: number;
      transaction: string;
    }>;

export default function TransactionsTable({
  filters,
  selectedTransactions,
  setSelectedTransactions,
  transactions: transactions$key,
}: {
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
  transactions: TransactionsTable$key;
}) {
  const {
    data: { transactions },
    hasNext,
    isLoadingNext,
    loadNext,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment TransactionsTable on Query
      @refetchable(queryName: "TransactionsPaginationQuery") {
        transactions(first: $first, after: $after, filters: $filters)
          @connection(key: "TransactionsTable_transactions") {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              completed
              amount
              ...TransactionsTable__RenderCell
            }
          }
        }
      }
    `,
    transactions$key,
  );

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Transactions, () => {
      refetch({ filters }, { fetchPolicy: "network-only" });
    });
  }, [filters, refetch, subscribe]);

  const selectedIds = useMemo<"all" | Set<string>>(() => {
    if (selectedTransactions === "all") {
      return "all";
    }

    let ids: string[] = [];

    if (selectedTransactions instanceof Set) {
      ids = [...selectedTransactions.values()].map(
        (select) => select.transaction,
      );
    }

    return new Set(ids);
  }, [selectedTransactions]);

  const transactionAmounts: Map<string, number> = useMemo(
    () =>
      (transactions?.edges || []).reduce((amounts, edge) => {
        amounts.set(edge?.node.id, edge?.node.amount);

        return amounts;
      }, new Map()),
    [transactions],
  );

  const onSelectionChange = useCallback(
    (selected: Selection) => {
      if (selected === "all") {
        setSelectedTransactions("all");
      }

      if (selected instanceof Set) {
        setSelectedTransactions(
          new Set(
            [...selected.values()].map((select) => ({
              amount: transactionAmounts.get(select.toString()) ?? 0,
              transaction: select.toString(),
            })),
          ),
        );
      }
    },
    [setSelectedTransactions, transactionAmounts],
  );

  const loadMore = useCallback(() => {
    loadNext(PER_PAGE);
  }, [loadNext]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNext,
    onLoadMore: loadMore,
  });

  const columns = useMemo(
    () =>
      Object.values(Colunms).map((column) => ({
        key: column,
        label: column,
      })),
    [],
  );

  const cellAlign = useCallback((columnKey: Colunms) => {
    switch (columnKey) {
      case Colunms.Date:
        return "text-center";

      case Colunms.Description:
        return "text-left";

      case Colunms.Amount:
        return "text-right";

      case Colunms.Source:
        return "justify-center items-center align-middle";

      case Colunms.Categories:
        return "text-left";

      case Colunms.CategoriesButton:
        return "text-center";
    }
  }, []);

  return (
    <Table
      aria-label="Example empty table"
      baseRef={scrollerRef}
      bottomContent={
        hasNext ? (
          <div className="flex w-full justify-center">
            <Spinner color="default" ref={loaderRef} />
          </div>
        ) : null
      }
      classNames={{
        base: "max-h-[720px] overflow-scroll",
      }}
      isHeaderSticky
      onSelectionChange={onSelectionChange}
      radius="none"
      selectedKeys={selectedIds}
      selectionMode="multiple"
      shadow="none"
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            className={cellAlign(column.key as Colunms)}
            key={column.key}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        isLoading={isLoadingNext}
        items={transactions?.edges}
        loadingContent={<Spinner color="default" />}
      >
        {(item) => (
          <TableRow
            className={`${
              item?.node.completed
                ? "bg-white hover:bg-stone-100"
                : "bg-lime-50 hover:bg-lime-100"
            } `}
            key={item?.node.id}
          >
            {(columnKey) => (
              <TableCell className={cellAlign(columnKey as Colunms)}>
                {item?.node == null ? null : (
                  <RenderCell
                    columnKey={columnKey as Colunms}
                    transaction={item.node}
                  />
                )}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function RenderCell({
  columnKey,
  transaction: transaction$key,
}: {
  columnKey: Colunms;
  transaction: TransactionsTable__RenderCell$key;
}) {
  const transaction = useFragment(
    graphql`
      fragment TransactionsTable__RenderCell on Transaction {
        ...TransactionDateCell
        ...TransactionDescriptionCell
        ...TransactionAmountCell
        ...TransactionSourceCell
        ...TransactionCategoriesCell
        ...TransactionCategoriesButtonCell
      }
    `,
    transaction$key,
  );

  switch (columnKey) {
    case Colunms.Date:
      return <TransactionDateCell transaction={transaction} />;

    case Colunms.Description:
      return <TransactionDescriptionCell transaction={transaction} />;

    case Colunms.Amount:
      return <TransactionAmountCell transaction={transaction} />;

    case Colunms.Source:
      return <TransactionSourceCell transaction={transaction} />;

    case Colunms.Categories:
      return <TransactionCategoriesCell transaction={transaction} />;

    case Colunms.CategoriesButton:
      return <TransactionCategoriesButtonCell transaction={transaction} />;
  }
}
