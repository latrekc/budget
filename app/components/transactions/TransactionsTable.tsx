"use client";

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
import { useCallback, useMemo } from "react";
import { graphql, useFragment, usePaginationFragment } from "react-relay";
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
  "Date" = "Date",
  "Description" = "Description",
  "Categories" = "Categories",
  "CategoriesButton" = "",
  "Amount" = "Amount",
}

export const PER_PAGE = 20;

export type TransactionsSelection =
  | "all"
  | Set<{
      transaction: string;
      amount: number;
    }>;

export default function TransactionsTable({
  selectedTransactions,
  setSelectedTransactions,
  transactions: transactions$key,
}: {
  transactions: TransactionsTable$key;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const {
    data: { transactions },
    loadNext,
    isLoadingNext,
    hasNext,
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
      transactions.edges.reduce((amounts, edge) => {
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
              transaction: select.toString(),
              amount: transactionAmounts.get(select.toString()) ?? 0,
            })),
          ),
        );
      }
    },
    [selectedTransactions],
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
      radius="none"
      shadow="none"
      isHeaderSticky
      baseRef={scrollerRef}
      selectionMode="multiple"
      selectedKeys={selectedIds}
      onSelectionChange={onSelectionChange}
      bottomContent={
        hasNext ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="default" />
          </div>
        ) : null
      }
      classNames={{
        base: "max-h-[720px] overflow-scroll",
        table: "min-h-[600px]",
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            className={cellAlign(column.key as Colunms)}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        items={transactions?.edges}
        isLoading={isLoadingNext}
        loadingContent={<Spinner color="default" />}
      >
        {(item) => (
          <TableRow
            key={item?.node.id}
            className={`${
              item?.node.completed
                ? "bg-white hover:bg-stone-100"
                : "bg-lime-50 hover:bg-lime-100"
            } `}
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
