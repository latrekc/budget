import { Select, SelectItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";
import DashboardByTimePeriods, { Period } from "./DashboardByTimePeriods";

export default function Dashboard() {
  const periods = [
    { label: "Years", value: Period.Years },
    { label: "Months", value: Period.Months },
  ];
  const [period, setPeriod] = useState<Period>(Period.Months);

  const onSelectionChange = useCallback((keys: "all" | Set<React.Key>) => {
    if (keys instanceof Set) {
      setPeriod([...keys.values()].map((k) => k.toString())[0] as Period);
    }

    return keys;
  }, []);

  const data = useLazyLoadQuery<DashboardQuery>(
    graphql`
      query DashboardQuery(
        $include_months: Boolean!
        $include_years: Boolean!
      ) {
        ...DashboardByTimePeriods
          @arguments(
            include_months: $include_months
            include_years: $include_years
          )
      }
    `,
    {
      include_months: period === Period.Months,
      include_years: period === Period.Years,
    },
  );

  return (
    <div className="p-6">
      <Select
        className="max-w-xs"
        label="Stat by"
        onSelectionChange={onSelectionChange}
        placeholder="Select a period"
        selectedKeys={[period.toString()]}
        size="lg"
        variant="bordered"
      >
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </Select>

      <DashboardByTimePeriods period={period} statistic={data} />
    </div>
  );
}
