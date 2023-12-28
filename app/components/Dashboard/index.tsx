import { Select, SelectItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import DashboardByTimePeriods, { Period } from "./DashboardByTimePeriods";
import { DashboardQuery } from "./__generated__/DashboardQuery.graphql";

export default function Dashboard() {
  const periods = [
    { label: "Years", value: Period.Years },
    { label: "Months", value: Period.Months },
    { label: "Days", value: Period.Days },
  ];
  const [period, setPeriod] = useState<Period>(Period.Years);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    Period.Years.toString(),
  ]);

  const onSelectionChange = useCallback((keys: "all" | Set<React.Key>) => {
    if (keys instanceof Set) {
      setSelectedKeys([...keys.values()].map((k) => k.toString()));
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
        ...DashboardByTimePeriods_statistic
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
        label="Stat by"
        variant="bordered"
        placeholder="Select a period"
        selectedKeys={selectedKeys}
        className="max-w-xs"
        size="lg"
        onSelectionChange={onSelectionChange}
      >
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </Select>

      <DashboardByTimePeriods statistic={data} period={period} />
    </div>
  );
}
