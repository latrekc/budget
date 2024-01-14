"use client";

import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";

import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";

type EChartsOption = echarts.EChartsOption;

export enum Period {
  Days = "Days",
  Months = "Months",
  Years = "Years",
}

export default function DashboardByTimePeriods({
  period,
  statistic: statistic$key,
}: {
  period: Period;
  statistic: DashboardByTimePeriods$key;
}) {
  const data = useFragment(
    graphql`
      fragment DashboardByTimePeriods on Query
      @argumentDefinitions(
        include_months: { type: "Boolean!" }
        include_years: { type: "Boolean!" }
      ) {
        transactions_statistic_per_months @include(if: $include_months) {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
        }

        transactions_statistic_per_years @include(if: $include_years) {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
        }
      }
    `,
    statistic$key,
  );

  const records = useMemo(() => {
    switch (period) {
      case Period.Years:
        return data.transactions_statistic_per_years ?? [];
      case Period.Months:
        return data.transactions_statistic_per_months ?? [];
      case Period.Days:
        return [];
    }
  }, [
    data.transactions_statistic_per_years,
    data.transactions_statistic_per_months,
    period,
  ]);

  const option: EChartsOption = useMemo(
    () => ({
      dataZoom:
        period === Period.Years
          ? [{ end: 100, show: false, start: 0, type: "slider" }]
          : [
              {
                end: 100,
                minSpan: 10,
                show: true,
                start: 90,
                type: "slider",
              },
            ],
      legend: {},
      series: [
        {
          color: "#14532d",
          data: records.map(({ id, income }) => [id, Math.round(income)]),
          name: "Income",
          step: "middle",
          type: "line",
        },

        {
          color: "#7f1d1d",
          data: records.map(({ id, outcome }) => [
            id,
            Math.round(Math.abs(outcome)),
          ]),
          name: "Outcome",
          step: "middle",
          type: "line",
        },
        {
          areaStyle: {},
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
        position: function (pt: (number | string)[]) {
          return [pt[0], "10%"];
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
      xAxis: {
        boundaryGap: false,
        type: "time",
      },
      yAxis: {
        boundaryGap: [0, "20%"],
        type: "value",
      },
    }),
    [period, records],
  );

  return <ReactECharts className="min-h-[720px] bg-white" option={option} />;
}
