import { graphql, useLazyLoadQuery } from "react-relay";
import DashboardByTimePeriods from "./DashboardByTimePeriods";
import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";

export default function Dashboard() {
  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery {
        ...DashboardByTimePeriods_statistic
      }
    `,
    {},
  );

  return (
    <div className="p-6">
      <h1 className="pb-6 text-3xl">Stat by months</h1>
      <DashboardByTimePeriods statistic={data} />
    </div>
  );
}
