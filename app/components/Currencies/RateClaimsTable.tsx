"use client";

import { Currency, DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
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
import { RefObject, useCallback, useEffect, useMemo } from "react";
import { graphql, useFragment, usePaginationFragment } from "react-relay";
import { RateClaimsTable$key } from "./__generated__/RateClaimsTable.graphql";
import { RateClaimsTable_RenderCell$key } from "./__generated__/RateClaimsTable_RenderCell.graphql";
import RateClaimDateCell from "./cell/RateClaimDateCell";
import RateClaimValueCell from "./cell/RateClaimValueCell";

export const PER_PAGE = 20;

enum Colunms {
  "Date" = "Date",
  "Value" = "Value",
}

export default function RateClaimsTable({
  claims: claims$key,
  currency,
}: {
  claims: RateClaimsTable$key;
  currency: Currency;
}) {
  const {
    data: { rate_claims: claims },
    hasNext,
    isLoadingNext,
    loadNext,
    refetch,
  } = usePaginationFragment(
    graphql`
      fragment RateClaimsTable on Query
      @refetchable(queryName: "RateClaimsPaginationQuery") {
        rate_claims(first: $first, after: $after, currency: $currency)
          @connection(key: "RateClaimsTable_rate_claims") {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              ...RateClaimsTable_RenderCell
            }
          }
        }
      }
    `,
    claims$key,
  );

  const loadMore = useCallback(() => {
    if (hasNext && !isLoadingNext) {
      loadNext(PER_PAGE);
    }
  }, [hasNext, isLoadingNext, loadNext]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNext,
    onLoadMore: loadMore,
  });

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.CurrencyExchangeRates, () => {
      refetch({ currency }, { fetchPolicy: "network-only" });
    });
  }, [currency, refetch, subscribe]);

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

  const items = useMemo(() => claims?.edges ?? [], [claims?.edges]);

  return (
    <Table
      aria-label="Rates"
      baseRef={scrollerRef}
      bottomContent={
        <div
          className="flex w-full justify-center"
          data-is-loading={isLoadingNext ? "true" : "false"}
          data-testid="table-load-more"
          onClick={loadMore}
          ref={loaderRef as RefObject<HTMLDivElement>}
        >
          {isLoadingNext ? <Spinner color="default" /> : null}
        </div>
      }
      classNames={{
        wrapper: "max-h-[720px] overflow-y-auto",
      }}
      isHeaderSticky
      radius="none"
      shadow="none"
      topContent={
        <h2>
          Claims for currency rates for {currency} to {DEFAULT_CURRENCY}
        </h2>
      }
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

      <TableBody emptyContent="No records" items={items}>
        {(item) => (
          <TableRow
            className={"bg-white hover:bg-stone-100"}
            key={item?.node?.id}
          >
            {(columnKey) => (
              <TableCell className={cellAlign(columnKey as Colunms)}>
                {item?.node == null ? null : (
                  <RenderCell
                    claim={item.node}
                    columnKey={columnKey as Colunms}
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
  claim: claim$key,
  columnKey,
}: {
  claim: RateClaimsTable_RenderCell$key;
  columnKey: Colunms;
}) {
  const claim = useFragment(
    graphql`
      fragment RateClaimsTable_RenderCell on CurrencyExchangeRateClaim {
        ...RateClaimDateCell
        ...RateClaimValueCell
      }
    `,
    claim$key,
  );

  switch (columnKey) {
    case Colunms.Date:
      return <RateClaimDateCell claim={claim} />;

    case Colunms.Value:
      return <RateClaimValueCell claim={claim} />;
  }
}
