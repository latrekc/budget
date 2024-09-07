import { graphql, useLazyLoadQuery } from "react-relay";

import Filters from "../Filters";
import useFilters from "../Filters/useFilters";
import DashboardByTimePeriods from "./DashboardByTimePeriods";
import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";

export default function Dashboard() {
  const { statisticFiltersState } = useFilters();

  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($filters: filterStatisticInput) {
        ...Filters
        ...DashboardByTimePeriods
      }
    `,
    { filters: statisticFiltersState },
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
