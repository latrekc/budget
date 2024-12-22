"use client";
import dynamic from "next/dynamic";

import { DashboardQuery } from "@/components/Dashboard";
import { DashboardQuery as DashboardQueryType } from "@/components/Dashboard/__generated__/DashboardQuery.graphql";
import { useFilters } from "@/components/Filters/FiltersProvider";
import Header, { PageType } from "@/components/Header";
import Loading from "@/components/Loading";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
});

export default function Page() {
  const { categoryFiltersState, statisticFiltersState } = useFilters();

  const [preloadedQuery, loadQuery] =
    useQueryLoader<DashboardQueryType>(DashboardQuery);

  useEffect(() => {
    loadQuery(
      {
        categoryFilters: categoryFiltersState,
        statisticFilters: statisticFiltersState,
      },
      { fetchPolicy: "store-and-network" },
    );
  }, [categoryFiltersState, loadQuery, statisticFiltersState]);

  const deferredQuery = useDeferredValue(preloadedQuery);

  return (
    <>
      <Header active={PageType.Dashboard} />
      <div suppressHydrationWarning>
        {deferredQuery != null ? (
          <Suspense fallback={<Loading />}>
            <div
              className={deferredQuery !== preloadedQuery ? "opacity-50" : ""}
            >
              <Dashboard preloadedQuery={deferredQuery} />
            </div>
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}
