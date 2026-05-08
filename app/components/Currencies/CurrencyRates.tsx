import { Currency, DEFAULT_CURRENCY } from "@/lib/types";
import { Suspense } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import Loading from "../Loading";
import { CurrencyRatesQuery } from "./__generated__/CurrencyRatesQuery.graphql";
import RateClaimsTable, { PER_PAGE } from "./RateClaimsTable";
import RatesTable from "./RatesTable";

export default function CurrencyRates({ currency }: { currency: Currency }) {
  const data = useLazyLoadQuery<CurrencyRatesQuery>(
    graphql`
      query CurrencyRatesQuery(
        $first: Int
        $after: String
        $base: Currency!
        $target: Currency!
        $currency: Currency!
      ) {
        ...RateClaimsTable
        ...RatesTable
      }
    `,
    {
      base: DEFAULT_CURRENCY,
      currency,
      first: PER_PAGE,
      target: currency,
    },
    { fetchPolicy: "store-or-network" },
  );

  return (
    <div className="flex flex-row">
      <div className="basis-1/2 py-3">
        <Suspense fallback={<Loading />}>
          <div>
            <RateClaimsTable claims={data} currency={currency} />
          </div>
        </Suspense>
      </div>

      <div className="basis-1/2 py-3">
        <Suspense fallback={<Loading />}>
          <div>
            <RatesTable currency={currency} rates={data} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
