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
import TransactionIdCell from "./cell/TransactionIdCell";
import TransactionSourceCell from "./cell/TransactionSourceCell";

enum Colunms {
  "Id" = "ID",
  "Source" = "Source",
  "Date" = "Date",
  "Description" = "Description",
  "Categories" = "Categories",
  "CategoriesButton" = "",
  "Amount" = "Amount",
}

export const PER_PAGE = 20;

export default function TransactionsTable({
  selectedTransactions,
  setSelectedTransactions,
  transactions: transactions$key,
}: {
  transactions: TransactionsTable$key;
  selectedTransactions: Selection;
  setSelectedTransactions: (selected: Selection) => void;
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
              ...TransactionsTable__RenderCell
            }
          }
        }
      }
    `,
    transactions$key,
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
      case Colunms.Id:
        return "text-center";

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
      selectedKeys={selectedTransactions}
      onSelectionChange={setSelectedTransactions}
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
        ...TransactionIdCell
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
    case Colunms.Id:
      return <TransactionIdCell transaction={transaction} />;

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
