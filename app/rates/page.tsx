"use client";
import dynamic from "next/dynamic";

import Header, { PageType } from "@/components/Header";
import Loading from "@/components/Loading";
import { RatesQuery } from "@/components/Rates";
import { RatesQuery as RatesQueryType } from "@/components/Rates/__generated__/RatesQuery.graphql";
import { CLAIMS_FILTERS } from "@/components/Rates/RateClaimsTable";
import { PER_PAGE, RATES_FILTERS } from "@/components/Rates/RatesTable";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";

const Rates = dynamic(() => import("@/components/Rates"), {
  ssr: false,
});

export default function Page() {
  const [preloadedQuery, loadQuery] =
    useQueryLoader<RatesQueryType>(RatesQuery);

  useEffect(() => {
    loadQuery(
      {
        claimFilters: CLAIMS_FILTERS,
        filters: RATES_FILTERS,
        first: PER_PAGE,
      },
      { fetchPolicy: "store-and-network" },
    );
  }, [loadQuery]);

  const deferredQuery = useDeferredValue(preloadedQuery);

  return (
    <>
      <Header active={PageType.Rates} />
      <div suppressHydrationWarning>
        {deferredQuery != null ? (
          <Suspense fallback={<Loading />}>
            <div
              className={deferredQuery !== preloadedQuery ? "opacity-50" : ""}
            >
              <Rates preloadedQuery={deferredQuery} />
            </div>
          </Suspense>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}
