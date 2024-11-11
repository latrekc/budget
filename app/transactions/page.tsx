"use client";
import dynamic from "next/dynamic";

import { useFilters } from "@/components/Filters/FiltersProvider";
import Header, { PageType } from "@/components/Header";
import { TransactionsQuery } from "@/components/Transactions";
import { PER_PAGE } from "@/components/Transactions/TransactionsTable";
import { TransactionsQuery as TransactionsQueryType } from "@/components/Transactions/__generated__/TransactionsQuery.graphql";
import { useDeferredPromise } from "@/lib/useDeferredPromise";
import usePrevious from "@/lib/usePrevious";
import { CircularProgress } from "@nextui-org/react";
import { Suspense, useEffect } from "react";
import { PreloadedQuery, useQueryLoader } from "react-relay";

const Transactions = dynamic(() => import("@/components/Transactions"), {
  ssr: false,
});

export default function Page() {
  const { categoryFiltersState, filtersState } = useFilters();

  const [preloadedQuery, loadQuery] =
    useQueryLoader<TransactionsQueryType>(TransactionsQuery);
  const previousQuery = usePrevious(preloadedQuery);

  const { defer, deferRef } =
    useDeferredPromise<PreloadedQuery<TransactionsQueryType>>();

  useEffect(() => {
    defer();

    loadQuery(
      {
        categoryFilters: categoryFiltersState,
        filters: filtersState,
        first: PER_PAGE,
      },
      { fetchPolicy: "store-and-network" },
    );
  }, [categoryFiltersState, defer, filtersState, loadQuery]);

  if (preloadedQuery == null) {
    if (!deferRef) {
      throw defer().promise;
    } else {
      throw deferRef.promise;
    }
  } else if (previousQuery != preloadedQuery) {
    deferRef?.resolve(preloadedQuery);
  }

  return (
    <>
      <Header active={PageType.Transactions} />
      <div suppressHydrationWarning>
        <Suspense fallback={<CircularProgress label="Loading..." />}>
          <Transactions preloadedQuery={preloadedQuery} />
        </Suspense>
      </div>
    </>
  );
}
