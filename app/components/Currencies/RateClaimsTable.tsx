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
import { RateClaimsTable$key } from "./__generated__/RateClaimsTable.graphql";
import { RateClaimsTable_RenderCell$key } from "./__generated__/RateClaimsTable_RenderCell.graphql";
import RateClaimCurrencyCell from "./cell/RateClaimCurrencyCell";
import RateClaimDateCell from "./cell/RateClaimDateCell";
import RateClaimValueCell from "./cell/RateClaimValueCell";

export const PER_PAGE = 20;

export const CLAIMS_FILTERS = {
  currency: DEFAULT_CURRENCY,
};

enum Colunms {
  "Date" = "Date",
  // eslint-disable-next-line perfectionist/sort-enums
  "Currency" = "Currency",
  "Value" = "Value",
}

export default function RateClaimsTable({
  claims: claims$key,
}: {
  claims: RateClaimsTable$key;
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
        rate_claims(first: $first, after: $after, filters: $claimFilters)
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
    loadNext(PER_PAGE);
  }, [loadNext]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasNext,
    onLoadMore: loadMore,
  });

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.CurrencyExchangeRates, () => {
      refetch(
        { claimFilters: CLAIMS_FILTERS },
        { fetchPolicy: "network-only" },
      );
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

  const items = useMemo(() => claims?.edges ?? [], [claims?.edges]);

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
      topContent={<h2>Claims for currency rates for {DEFAULT_CURRENCY}</h2>}
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
        ...RateClaimCurrencyCell
        ...RateClaimValueCell
      }
    `,
    claim$key,
  );

  switch (columnKey) {
    case Colunms.Date:
      return <RateClaimDateCell claim={claim} />;

    case Colunms.Currency:
      return <RateClaimCurrencyCell claim={claim} />;

    case Colunms.Value:
      return <RateClaimValueCell claim={claim} />;
  }
}
