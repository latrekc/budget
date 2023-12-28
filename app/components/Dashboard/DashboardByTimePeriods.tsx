"use client";

import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { DashboardByTimePeriods_statistic$key } from "./__generated__/DashboardByTimePeriods_statistic.graphql";

type EChartsOption = echarts.EChartsOption;

export default function DashboardByTimePeriods({
  statistic: statistic$key,
}: {
  statistic: DashboardByTimePeriods_statistic$key;
}) {
  const data = useFragment(
    graphql`
      fragment DashboardByTimePeriods_statistic on Query {
        transactions_statistic_per_months {
          id
          income
          outcome
        }
      }
    `,
    statistic$key,
  );

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        position: function (pt: (string | number)[]) {
          return [pt[0], "10%"];
        },
        valueFormatter(amount) {
          return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            maximumFractionDigits: 0,
          }).format(amount as number);
        },
      },
      legend: {},
      xAxis: {
        type: "time",
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        boundaryGap: [0, "20%"],
      },
      dataZoom: [
        {
          type: "slider",
          start: 90,
          end: 100,
          minSpan: 10,
        },
      ],
      series: [
        {
          name: "Income",
          type: "line",
          step: "middle",
          color: "#14532d",
          data: data.transactions_statistic_per_months.map(({ id, income }) => [
            id,
            Math.round(income),
          ]),
        },

        {
          name: "Outcome",
          type: "line",
          step: "middle",
          color: "#7f1d1d",
          data: data.transactions_statistic_per_months.map(
            ({ id, outcome }) => [id, Math.round(Math.abs(outcome))],
          ),
        },
        {
          name: "Saldo",
          type: "line",
          symbol: "none",
          step: "middle",
          data: data.transactions_statistic_per_months.map(
            ({ id, income, outcome }) => [id, Math.round(income + outcome)],
          ),
          areaStyle: {},
          color: "#000",
        },
      ],
      visualMap: [
        {
          type: "continuous",
          splitNumber: 0,
          show: false,
          dimension: 1,
          seriesIndex: 2,
          min: 0,
          max: 1,
          inRange: {
            color: ["red", "green"],
          },
          text: [">0", "<0"],
          calculable: true,
        },
      ],
    }),
    [],
  );

  return <ReactECharts option={option} className="min-h-[720px] bg-white" />;
}
