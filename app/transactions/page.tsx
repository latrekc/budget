"use client";
import dynamic from "next/dynamic";

import { useFilters } from "@/components/Filters/FiltersProvider";
import Header, { PageType } from "@/components/Header";
import Loading from "@/components/Loading";
import { TransactionsQuery } from "@/components/Transactions";
import { PER_PAGE } from "@/components/Transactions/TransactionsTable";
import { TransactionsQuery as TransactionsQueryType } from "@/components/Transactions/__generated__/TransactionsQuery.graphql";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";

const Transactions = dynamic(() => import("@/components/Transactions"), {
  ssr: false,
});

export default function Page() {
  const { categoryFiltersState, filtersState } = useFilters();

  const [preloadedQuery, loadQuery] =
    useQueryLoader<TransactionsQueryType>(TransactionsQuery);

  useEffect(() => {
    loadQuery(
      {
        categoryFilters: categoryFiltersState,
        filters: filtersState,
        first: PER_PAGE,
      },
      { fetchPolicy: "store-and-network" },
    );
  }, [categoryFiltersState, filtersState, loadQuery]);

  const deferredQuery = useDeferredValue(preloadedQuery);

  return (
    <>
      <Header active={PageType.Transactions} />
      <div suppressHydrationWarning>
        {deferredQuery != null ? (
          <Suspense fallback={<Loading />}>
            <div
              className={deferredQuery !== preloadedQuery ? "opacity-50" : ""}
            >
              <Transactions preloadedQuery={deferredQuery} />
            </div>
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}
