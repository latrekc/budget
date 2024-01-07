"use client";

import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";

type EChartsOption = echarts.EChartsOption;

export enum Period {
  Years = "Years",
  Months = "Months",
  Days = "Days",
}

export default function DashboardByTimePeriods({
  statistic: statistic$key,
  period,
}: {
  statistic: DashboardByTimePeriods$key;
  period: Period;
}) {
  const data = useFragment(
    graphql`
      fragment DashboardByTimePeriods on Query
      @argumentDefinitions(
        include_months: { type: "Boolean!" }
        include_years: { type: "Boolean!" }
      ) {
        transactions_statistic_per_months @include(if: $include_months) {
          id
          income
          outcome
        }

        transactions_statistic_per_years @include(if: $include_years) {
          id
          income
          outcome
        }
      }
    `,
    statistic$key,
  );

  const records =
    useMemo(() => {
      switch (period) {
        case Period.Years:
          return data.transactions_statistic_per_years;
        case Period.Months:
          return data.transactions_statistic_per_months;
        case Period.Days:
          return [];
      }
    }, [data, period]) ?? [];

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
      dataZoom:
        period === Period.Years
          ? [{ type: "slider", start: 0, end: 100, show: false }]
          : [
              {
                type: "slider",
                start: 90,
                end: 100,
                minSpan: 10,
                show: true,
              },
            ],
      series: [
        {
          name: "Income",
          type: "line",
          step: "middle",
          color: "#14532d",
          data: records.map(({ id, income }) => [id, Math.round(income)]),
        },

        {
          name: "Outcome",
          type: "line",
          step: "middle",
          color: "#7f1d1d",
          data: records.map(({ id, outcome }) => [
            id,
            Math.round(Math.abs(outcome)),
          ]),
        },
        {
          name: "Saldo",
          type: "line",
          symbol: "none",
          step: "middle",
          data: records.map(({ id, income, outcome }) => [
            id,
            Math.round(income + outcome),
          ]),
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
    [period, records],
  );

  return <ReactECharts option={option} className="min-h-[720px] bg-white" />;
}
