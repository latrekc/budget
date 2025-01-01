"use client";

import { DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
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
import { useCallback, useEffect, useMemo } from "react";
import { graphql, useFragment, usePaginationFragment } from "react-relay";
import { RatesTable$key } from "./__generated__/RatesTable.graphql";
import { RatesTable_RenderCell$key } from "./__generated__/RatesTable_RenderCell.graphql";
import RateCurrencyCell from "./cell/RateCurrencyCell";
import RateDateCell from "./cell/RateDateCell";
import RateDeleteCell from "./cell/RateDeleteCell";
import RateValueCell from "./cell/RateValueCell";

export const PER_PAGE = 20;

export const RATES_FILTERS = {
  base: [DEFAULT_CURRENCY],
};

enum Colunms {
  "Date" = "Date",
  // eslint-disable-next-line perfectionist/sort-enums
  "Currency" = "Currency",
  // eslint-disable-next-line perfectionist/sort-enums
  "Value" = "Value",
  // eslint-disable-next-line perfectionist/sort-enums
  "Delete" = "",
}

export default function RatesTable({
  rates: rates$key,
}: {
  rates: RatesTable$key;
}) {
  const {
    data: { rates },
    hasNext,
    isLoadingNext,
    loadNext,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment RatesTable on Query
      @refetchable(queryName: "RatesPaginationQuery") {
        rates(first: $first, after: $after, filters: $filters)
          @connection(key: "RatesTable_rates") {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              ...RatesTable_RenderCell
            }
          }
        }
      }
    `,
    rates$key,
  );

  const loadMore = useCallback(() => {
    loadNext(PER_PAGE);
  }, [loadNext]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNext,
    onLoadMore: loadMore,
  });

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.CurrencyExchangeRates, () => {
      refetch({ claimFilters: RATES_FILTERS }, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

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
        return "text-left";

      case Colunms.Value:
        return "text-right";
    }
  }, []);

  const items = useMemo(() => rates?.edges ?? [], [rates?.edges]);

  return (
    <Table
      aria-label="Rates"
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
      radius="none"
      shadow="none"
      topContent={<h2>Currency rates for {DEFAULT_CURRENCY}</h2>}
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
        emptyContent="No records"
        isLoading={isLoadingNext}
        items={items}
        loadingContent={<Spinner color="default" />}
      >
        {(item) => (
          <TableRow
            className={"bg-white hover:bg-stone-100"}
            key={item?.node.id}
          >
            {(columnKey) => (
              <TableCell className={cellAlign(columnKey as Colunms)}>
                {item?.node == null ? null : (
                  <RenderCell
                    columnKey={columnKey as Colunms}
                    rate={item.node}
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
  rate: rate$key,
}: {
  columnKey: Colunms;
  rate: RatesTable_RenderCell$key;
}) {
  const rate = useFragment(
    graphql`
      fragment RatesTable_RenderCell on CurrencyExchangeRate {
        ...RateDateCell
        ...RateCurrencyCell
        ...RateValueCell
        ...RateDeleteCell
      }
    `,
    rate$key,
  );

  switch (columnKey) {
    case Colunms.Date:
      return <RateDateCell rate={rate} />;
    case Colunms.Currency:
      return <RateCurrencyCell rate={rate} />;
    case Colunms.Value:
      return <RateValueCell rate={rate} />;
    case Colunms.Delete:
      return <RateDeleteCell rate={rate} />;
  }
}
