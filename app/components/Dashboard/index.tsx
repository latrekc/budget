import { graphql, PreloadedQuery, usePreloadedQuery } from "react-relay";

import Filters from "../Filters";
import DashboardByTimePeriods from "./DashboardByTimePeriods";
import { DashboardQuery as DashboardQueryType } from "./__generated__/DashboardQuery.graphql";

export const DashboardQuery = graphql`
  query DashboardQuery(
    $statisticFilters: FilterStatisticInput
    $categoryFilters: FilterCategoryInput
  ) {
    ...Filters
    ...DashboardByTimePeriods
  }
`;

export default function Dashboard({
  preloadedQuery,
}: {
  preloadedQuery: PreloadedQuery<DashboardQueryType>;
}) {
  const data = usePreloadedQuery<DashboardQueryType>(
    DashboardQuery,
    preloadedQuery,
  );

  return (
    <div className="flex flex-row">
      <div className="basis-3/4 py-3">
        <DashboardByTimePeriods statistic={data} />
      </div>

      <div className="basis-1/4 p-6">
        <Filters categories data={data} months />
      </div>
    </div>
  );
}
