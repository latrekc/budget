"use client";
import dynamic from "next/dynamic";

import { CurrenciesQuery } from "@/components/Currencies";
import { CurrenciesQuery as CurrenciesQueryType } from "@/components/Currencies/__generated__/CurrenciesQuery.graphql";
import { CLAIMS_FILTERS } from "@/components/Currencies/RateClaimsTable";
import { PER_PAGE, RATES_FILTERS } from "@/components/Currencies/RatesTable";
import Header, { PageType } from "@/components/Header";
import Loading from "@/components/Loading";
import { Suspense, useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";

const Rates = dynamic(() => import("@/components/Currencies"), {
  ssr: false,
});

export default function Page() {
  const [preloadedQuery, loadQuery] =
    useQueryLoader<CurrenciesQueryType>(CurrenciesQuery);

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
      <Header active={PageType.Currencies} />
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
