"use client";

import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";

import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";

type EChartsOption = echarts.EChartsOption;

export default function DashboardByTimePeriods({
  statistic: statistic$key,
}: {
  statistic: DashboardByTimePeriods$key;
}) {
  const data = useFragment(
    graphql`
      fragment DashboardByTimePeriods on Query {
        transactions_statistic_per_months {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
        }
      }
    `,
    statistic$key,
  );

  const records = useMemo(
    () => data.transactions_statistic_per_months ?? [],
    [data.transactions_statistic_per_months],
  );
  const option: EChartsOption = useMemo(
    () => ({
      dataZoom: [
        {
          end: 100,
          handleSize: 8,
          minSpan: 10,
          show: true,
          start: 0,
          type: "slider",
        },
      ],
      grid: {
        bottpm: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      legend: {},
      series: [
        {
          areaStyle: {
            color: "#7bc043",
          },
          color: "#7bc043",
          data: records.map(({ id, income }) => [id, Math.round(income)]),
          lineStyle: {
            opacity: 0,
          },
          name: "Income",
          step: "middle",
          symbol: "none",
          type: "line",
        },

        {
          areaStyle: {
            color: "#ee4035",
          },
          color: "#ee4035",
          data: records.map(({ id, outcome }) => [id, Math.round(outcome)]),
          lineStyle: {
            opacity: 0,
          },
          name: "Outcome",
          step: "middle",
          symbol: "none",
          type: "line",
        },
        {
          color: "#000",
          data: records.map(({ id, income, outcome }) => [
            id,
            Math.round(income + outcome),
          ]),
          name: "Saldo",
          step: "middle",
          symbol: "none",
          type: "line",
        },
      ],
      tooltip: {
        position: function () {
          return ["90%", "10%"];
        },
        trigger: "axis",
        valueFormatter(amount) {
          return new Intl.NumberFormat("en-GB", {
            currency: "GBP",
            maximumFractionDigits: 0,
            style: "currency",
          }).format(amount as number);
        },
      },
      visualMap: [
        {
          calculable: true,
          dimension: 1,
          inRange: {
            color: ["red", "green"],
          },
          max: 1,
          min: 0,
          seriesIndex: 2,
          show: false,
          splitNumber: 0,
          text: [">0", "<0"],
          type: "continuous",
        },
      ],
      width: "100%",
      xAxis: {
        boundaryGap: false,
        type: "time",
      },
      yAxis: {
        boundaryGap: false,
        type: "value",
      },
    }),
    [records],
  );

  return <ReactECharts className="min-h-[720px] bg-white" option={option} />;
}
