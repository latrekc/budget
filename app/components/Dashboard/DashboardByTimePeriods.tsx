"use client";

import ReactECharts from "echarts-for-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";

import { createRoot, Root } from "react-dom/client";

import { BarSeriesOption, graphic } from "echarts";
import { CategoryChip$key } from "../Categories/__generated__/CategoryChip.graphql";
import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";
import { DashboardTooltip } from "./DashboardTooltip";

type EChartsOption = echarts.EChartsOption;

type CategoryAggregation = {
  color: string;
  data: [string, null | number][];
  id: string;
  name: string;
};

type CategoryInformation = {
  color: string;
  id: string;
  key: CategoryChip$key;
  name: string;
  parentCategory: string | undefined;
  subCategories: string[] | undefined;
};

export default function DashboardByTimePeriods({
  statistic: statistic$key,
}: {
  statistic: DashboardByTimePeriods$key;
}) {
  const data = useFragment(
    graphql`
      fragment DashboardByTimePeriods on Query {
        categories(filters: $categoryFilters) @required(action: THROW) {
          color @required(action: THROW)
          id @required(action: THROW)
          name @required(action: THROW)
          parentCategory {
            id @required(action: THROW)
            parentCategory {
              id @required(action: THROW)
            }
          }
          subCategories @required(action: THROW) {
            id @required(action: THROW)
          }
          ...CategoryChip
        }
        transactionsStatistic(filters: $statisticFilters)
          @required(action: THROW) {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
          monthId @required(action: THROW)
          category @required(action: THROW) {
            id @required(action: THROW)
          }
        }
      }
    `,
    statistic$key,
  );

  const allCategories = useMemo(
    () =>
      data.categories.reduce<
        Map<string | undefined, CategoryInformation | undefined>
      >((all, category) => {
        if (!all.has(category.id)) {
          all.set(category.id, {
            ...category,
            key: category,
            parentCategory: category.parentCategory?.id,
            subCategories: category.subCategories.map(
              (subCategory) => subCategory.id,
            ),
          });
        }
        return all;
      }, new Map<string | undefined, CategoryInformation | undefined>()),
    [data.categories],
  );

  const monthsStatistic = useMemo(
    () =>
      [
        ...data.transactionsStatistic
          .reduce<
            Map<string, { income: number; month: string; outcome: number }>
          >((months, record) => {
            if (!months.has(record.monthId)) {
              months.set(record.monthId, {
                income: 0,
                month: record.monthId,
                outcome: 0,
              });
            }
            const month = months.get(record.monthId)!;

            month.income += record.income;
            month.outcome += record.outcome;

            return months;
          }, new Map<string, { income: number; month: string; outcome: number }>())
          .values(),
      ].sort(),
    [data.transactionsStatistic],
  );

  const categoriesStatistic = useMemo(
    () =>
      data.transactionsStatistic.reduce<Map<string, CategoryAggregation>>(
        (categories, record) => {
          if (!categories.has(record.category.id)) {
            const { color, name } = allCategories.get(record.category.id)!;
            categories.set(record.category.id, {
              ...record.category,
              color,
              data: [],
              name,
            } as CategoryAggregation);
          }
          const category = categories.get(record.category.id)!;

          if (record.income + record.outcome != 0) {
            category.data.push([
              record.monthId,
              Math.round(record.income + record.outcome),
            ]);
          }

          return categories;
        },
        new Map<string, CategoryAggregation>(),
      ),
    [allCategories, data.transactionsStatistic],
  );

  const tooltipNode = useRef<HTMLDivElement | null>(null);
  const tooltipRoot = useRef<Root | null>(null);
  useEffect(() => {
    tooltipNode.current = document.createElement("div");
    tooltipRoot.current = createRoot(tooltipNode.current);
  });

  const categoryToSeries = useCallback(
    (categoryA: CategoryAggregation) => {
      const category = allCategories.get(categoryA.id)!;
      const parentCategory = allCategories.get(category.parentCategory);
      const grandParentCategory = allCategories.get(
        parentCategory?.parentCategory,
      );

      return {
        color:
          grandParentCategory != undefined
            ? new graphic.LinearGradient(0, 0, 1, 0, [
                {
                  color: grandParentCategory.color,
                  offset: 0,
                },
                {
                  color: grandParentCategory.color,
                  offset: 0.5,
                },
                {
                  color: parentCategory!.color,
                  offset: 0.5,
                },
                {
                  color: parentCategory!.color,
                  offset: 0.75,
                },
                {
                  color: category.color,
                  offset: 0.75,
                },
                {
                  color: category.color,
                  offset: 1,
                },
              ])
            : parentCategory != undefined
              ? new graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    color: parentCategory.color,
                    offset: 0,
                  },
                  {
                    color: parentCategory.color,
                    offset: 0.5,
                  },
                  {
                    color: category.color,
                    offset: 0.5,
                  },
                  {
                    color: category.color,
                    offset: 1,
                  },
                ])
              : category.color,
        data: monthsStatistic.map(({ month }) => {
          const value = categoryA.data.find((i) => i[0] === month);
          return [month, value != undefined ? value[1] : null];
        }),
        emphasis: {
          focus: "series",
        },
        id: category.id,
        label: {
          show: false,
        },
        name: category.name,
        stack: "total",
        tooltip: {
          formatter(params) {
            if (params instanceof Array) {
              throw new Error("No array params here please");
            }

            if (tooltipNode.current == null || tooltipRoot.current == null) {
              throw new Error("No root");
            }

            tooltipRoot.current.render(
              <DashboardTooltip
                category={category}
                data={categoryA.data}
                grandParentCategory={grandParentCategory}
                parentCategory={parentCategory}
              />,
            );
            return tooltipNode.current;
          },
        },
        type: "bar",
        z: 2,
      } as BarSeriesOption;
    },
    [allCategories, monthsStatistic],
  );

  const categoriesOrder = useMemo(
    () =>
      [
        ...[...allCategories.values()]
          .map((category) => {
            if (category == null || category?.parentCategory != null) {
              return [];
            }

            const result = [];

            if (categoriesStatistic.has(category.id)) {
              result.push(categoriesStatistic.get(category.id));
            }

            if (category.subCategories != undefined) {
              category.subCategories.forEach((subCategory) => {
                if (categoriesStatistic.has(subCategory)) {
                  result.push(categoriesStatistic.get(subCategory));
                }

                allCategories
                  .get(subCategory)!
                  .subCategories?.forEach((subSubCategory) => {
                    if (categoriesStatistic.has(subSubCategory)) {
                      result.push(categoriesStatistic.get(subSubCategory));
                    }
                  });
              });
            }

            return result;
          })
          .flat(),
      ].filter((category) => category != undefined),
    [allCategories, categoriesStatistic],
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
        {
          areaStyle: {
            color: "#7bc043",
            opacity: 0.2,
          },
          color: "#7bc043",
          data: monthsStatistic
            .filter(({ income }) => income > 0)
            .map(({ income, month }) => [month, Math.round(income)]),
          lineStyle: {
            opacity: 0,
          },
          name: "Income",
          step: "middle",
          symbol: "none",
          type: "line",
          z: 0,
        },

        {
          areaStyle: {
            color: "#ee4035",
            opacity: 0.2,
          },
          color: "#ee4035",
          data: monthsStatistic
            .filter(({ outcome }) => outcome < 0)
            .map(({ month, outcome }) => [month, Math.round(outcome)]),
          lineStyle: {
            opacity: 0,
          },
          name: "Outcome",
          step: "middle",
          symbol: "none",
          type: "line",
          z: 0,
        },
        {
          color: "#000",
          data: monthsStatistic
            .filter(({ income, outcome }) => income + outcome != 0)
            .map(({ income, month, outcome }) => [
              month,
              Math.round(income + outcome),
            ]),
          name: "Saldo",
          step: "middle",
          symbol: "none",
          type: "line",
          z: 1,
        },
        ...categoriesOrder.map((category) => categoryToSeries(category!)),
      ],
      tooltip: {
        alwaysShowContent: true,
        enterable: true,
        trigger: "item",
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
    [categoriesOrder, categoryToSeries, monthsStatistic],
  );

  return <ReactECharts className="min-h-[1000px] bg-white" option={option} />;
}
