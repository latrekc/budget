import { graphql, useLazyLoadQuery } from "react-relay";

import Filters from "../Filters";
import DashboardByTimePeriods from "./DashboardByTimePeriods";
import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";

export default function Dashboard() {
  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery {
        ...Filters
        ...DashboardByTimePeriods
      }
    `,
    {},
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
