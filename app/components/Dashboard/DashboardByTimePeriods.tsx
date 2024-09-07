"use client";

import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";

import { BarSeriesOption } from "echarts";
import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";

type EChartsOption = echarts.EChartsOption;

type CategoryAggregation = {
  color: string;
  data: [string, number][];
  id: string;
  name: string;
};

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
        transactions_statistic(filters: $filters) {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
          year @required(action: THROW)
          month @required(action: THROW)
          category @required(action: THROW) {
            id @required(action: THROW)
            name @required(action: THROW)
            color
          }
        }
      }
    `,
    statistic$key,
  );

  const totals_statistic = useMemo(
    () => data.transactions_statistic_per_months ?? [],
    [data.transactions_statistic_per_months],
  );
  const categories_statistic = useMemo(
    () => data.transactions_statistic ?? [],
    [data.transactions_statistic],
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
      legend: {
        show: false,
      },
      series: [
        ...[
          ...categories_statistic
            .reduce<Map<string, CategoryAggregation>>((categories, record) => {
              if (!categories.has(record.category.id)) {
                categories.set(record.category.id, {
                  ...record.category,
                  data: [],
                } as CategoryAggregation);
              }
              const category = categories.get(record.category.id)!;

              category.data.push([
                `${record.year}-${record.month}`,
                record.income,
              ]);

              return categories;
            }, new Map<string, CategoryAggregation>())
            .values(),
        ].map(
          (category) =>
            ({
              backgroundStyle: {
                color: category.color,
              },
              data: category.data,
              emphasis: {
                focus: "series",
              },
              if: `+${category.id}`,
              name: `+${category.name}`,
              stack: "total",
              type: "bar",
            }) as BarSeriesOption,
        ),
        ...[
          ...categories_statistic
            .reduce<Map<string, CategoryAggregation>>((categories, record) => {
              if (!categories.has(record.category.id)) {
                categories.set(record.category.id, {
                  ...record.category,
                  data: [],
                } as CategoryAggregation);
              }
              const category = categories.get(record.category.id)!;

              category.data.push([
                `${record.year}-${record.month}`,
                record.outcome,
              ]);

              return categories;
            }, new Map<string, CategoryAggregation>())
            .values(),
        ].map(
          (category) =>
            ({
              backgroundStyle: {
                color: category.color,
              },
              data: category.data,
              emphasis: {
                focus: "series",
              },
              if: `-${category.id}`,
              name: `-${category.name}`,
              stack: "total",
              type: "bar",
            }) as BarSeriesOption,
        ),

        {
          areaStyle: {
            color: "#7bc043",
            opacity: 0.2,
          },
          color: "#7bc043",
          data: totals_statistic.map(({ id, income }) => [
            id,
            Math.round(income),
          ]),
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
            opacity: 0.2,
          },
          color: "#ee4035",
          data: totals_statistic.map(({ id, outcome }) => [
            id,
            Math.round(outcome),
          ]),
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
          data: totals_statistic.map(({ id, income, outcome }) => [
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
    [categories_statistic, totals_statistic],
  );

  return <ReactECharts className="min-h-[720px] bg-white" option={option} />;
}
