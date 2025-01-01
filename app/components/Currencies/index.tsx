import { graphql, PreloadedQuery, usePreloadedQuery } from "react-relay";
import { CurrenciesQuery as CurrenciesQueryType } from "./__generated__/CurrenciesQuery.graphql";
import RateClaimsTable from "./RateClaimsTable";
import RatesTable from "./RatesTable";

export const CurrenciesQuery = graphql`
  query CurrenciesQuery(
    $first: Int
    $after: ID
    $filters: FilterRatesInput!
    $claimFilters: FilterRateClaimsInput!
  ) {
    ...RatesTable
    ...RateClaimsTable
  }
`;

export default function Rates({
  preloadedQuery,
}: {
  preloadedQuery: PreloadedQuery<CurrenciesQueryType>;
}) {
  const data = usePreloadedQuery<CurrenciesQueryType>(
    CurrenciesQuery,
    preloadedQuery,
  );

  return (
    <div className="flex flex-row">
      <div className="basis-1/2 py-3">
        <RateClaimsTable claims={data} />
      </div>
      <div className="basis-1/2 py-3">
        <RatesTable rates={data} />
      </div>
    </div>
  );
}
