import { graphql, PreloadedQuery, usePreloadedQuery } from "react-relay";
import { RatesQuery as RatesQueryType } from "./__generated__/RatesQuery.graphql";
import RateClaimsTable from "./RateClaimsTable";
import RatesTable from "./RatesTable";

export const RatesQuery = graphql`
  query RatesQuery(
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
  preloadedQuery: PreloadedQuery<RatesQueryType>;
}) {
  const data = usePreloadedQuery<RatesQueryType>(RatesQuery, preloadedQuery);

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
