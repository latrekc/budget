"use client";

import {
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
import { TransactionsTable__transaction$key } from "./__generated__/TransactionsTable__transaction.graphql";
import {
  TransactionsTable_transactions$data,
  TransactionsTable_transactions$key,
} from "./__generated__/TransactionsTable_transactions.graphql";
import TransactionAmountCell from "./cell/TransactionAmountCell";
import TransactionDateCell from "./cell/TransactionDateCell";
import TransactionDescriptionCell from "./cell/TransactionDescriptionCell";
import TransactionSourceCell from "./cell/TransactionSourceCell";

enum Colunms {
  "Source" = "Source",
  "Date" = "Date",
  "Description" = "Description",
  "Amount" = "Amount",
}

export const PER_PAGE = 20;

type Item = TransactionsTable_transactions$data["transactions"]["edges"][0];

export default function TransactionsTable({
  transactions: transactions$key,
}: {
  transactions: TransactionsTable_transactions$key;
}) {
  const {
    data: { transactions },
    loadNext,
    isLoadingNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment TransactionsTable_transactions on Query
      @refetchable(queryName: "TransactionsPaginationQuery") {
        transactions(first: $first, after: $after)
          @connection(key: "TransactionsTable_transactions") {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              ...TransactionsTable__transaction
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
      case Colunms.Date:
        return "text-center";

      case Colunms.Description:
        return "text-left";

      case Colunms.Amount:
        return "text-right";

      case Colunms.Source:
        return "flex justify-center items-center";
    }
  }, []);

  return (
    <Table
      aria-label="Example empty table"
      radius="none"
      shadow="none"
      isHeaderSticky
      baseRef={scrollerRef}
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
          <TableRow key={item?.node.id}>
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
  transaction: TransactionsTable__transaction$key;
}) {
  const transaction = useFragment(
    graphql`
      fragment TransactionsTable__transaction on Transaction {
        ...TransactionDateCell__transaction
        ...TransactionDescriptionCell__transaction
        ...TransactionAmountCell__transaction
        ...TransactionSourceCell__transaction
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
  }
}
