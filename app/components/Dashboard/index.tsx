import { graphql, useLazyLoadQuery } from "react-relay";

import Filters from "../Filters";
import { useFilters } from "../Filters/FiltersProvider";
import DashboardByTimePeriods from "./DashboardByTimePeriods";
import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";

export default function Dashboard() {
  const { categoryFiltersState, statisticFiltersState } = useFilters();

  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery(
        $statisticFilters: FilterStatisticInput
        $categoryFilters: FilterCategoryInput
      ) {
        ...Filters
        ...DashboardByTimePeriods
      }
    `,
    {
      categoryFilters: categoryFiltersState,
      statisticFilters: statisticFiltersState,
    },
    { fetchPolicy: "store-and-network" },
  );

  return (
    <div className="flex flex-row">
      <div className="basis-3/4 py-3">
        <DashboardByTimePeriods statistic={data} />
      </div>

      <div className="basis-1/4 p-6">
        <Filters data={data} />
      </div>
    </div>
  );
}
