"use client";

import ReactECharts from "echarts-for-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";

import { createRoot, Root } from "react-dom/client";

import {
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { BarSeriesOption, graphic } from "echarts";
import AmountValue, { Size } from "../AmountValue";
import { CategoryChip$key } from "../Categories/__generated__/CategoryChip.graphql";
import CategoryChip2 from "../Categories/CategoryChip2";
import { DashboardByTimePeriods$key } from "./__generated__/DashboardByTimePeriods.graphql";

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
        transactionsStatisticPerMonths @required(action: THROW) {
          id @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
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

  const visibleMonths = useMemo(
    () =>
      [
        ...data.transactionsStatistic
          .reduce<Set<string>>((months, record) => {
            months.add(record.monthId);
            return months;
          }, new Set<string>())
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
        data: visibleMonths.map((month) => {
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
    [allCategories, visibleMonths],
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
        ...categoriesOrder.map((category) => categoryToSeries(category!)),
        {
          areaStyle: {
            color: "#7bc043",
            opacity: 0.2,
          },
          color: "#7bc043",
          data: data.transactionsStatisticPerMonths
            .filter(({ id }) => visibleMonths.includes(id))
            .map(({ id, income }) => [id, Math.round(income)]),
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
          data: data.transactionsStatisticPerMonths
            .filter(({ id }) => visibleMonths.includes(id))
            .map(({ id, outcome }) => [id, Math.round(outcome)]),
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
          data: data.transactionsStatisticPerMonths
            .filter(({ id }) => visibleMonths.includes(id))
            .map(({ id, income, outcome }) => [
              id,
              Math.round(income + outcome),
            ]),
          name: "Saldo",
          step: "middle",
          symbol: "none",
          type: "line",
          z: 1,
        },
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
    [
      categoriesOrder,
      categoryToSeries,
      data.transactionsStatisticPerMonths,
      visibleMonths,
    ],
  );

  return <ReactECharts className="min-h-[2000px] bg-white" option={option} />;
}

function DashboardTooltip({
  category,
  data,
  grandParentCategory,
  parentCategory,
}: {
  category: { color: string; name: string };
  data: [string, null | number][];
  grandParentCategory: { color: string; name: string } | undefined;
  parentCategory: { color: string; name: string } | undefined;
}) {
  const rows = useMemo(
    () => [
      ...data
        .reduce<
          Map<string, { income: number; month: string; outcome: number }>
        >((all, [month, amount]) => {
          if (!all.has(month)) {
            all.set(month, { income: 0, month, outcome: 0 });
          }
          const row = all.get(month)!;

          if (amount != null) {
            if (amount > 0) {
              row.income = amount;
            }
            if (amount < 0) {
              row.outcome = amount;
            }
          }

          return all;
        }, new Map())
        .values(),
    ],
    [data],
  );

  const total = useMemo(
    () => data.reduce<number>((all, [_, amount]) => all + (amount ?? 0), 0),
    [data],
  );

  return (
    <>
      <div className="mb-4 flex shrink flex-row flex-wrap">
        <CategoryChip2
          amount={total}
          categories={[category, parentCategory, grandParentCategory]}
          currency="GBP"
        />
      </div>
      <ScrollShadow className="h-[400px]">
        <Table removeWrapper>
          <TableHeader>
            <TableColumn>Name</TableColumn>
            <TableColumn className="text-right">Income</TableColumn>
            <TableColumn className="text-right">Outcome</TableColumn>
            <TableColumn className="text-right">Saldo</TableColumn>
          </TableHeader>
          <TableBody>
            {rows.map(({ income, month, outcome }) => (
              <TableRow key="1">
                <TableCell>{month}</TableCell>
                <TableCell className="text-right">
                  {income > 0 ? (
                    <AmountValue
                      amount={income}
                      currency="GBP"
                      size={Size.Small}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {outcome < 0 ? (
                    <AmountValue
                      amount={outcome}
                      currency="GBP"
                      size={Size.Small}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {income + outcome != 0 ? (
                    <AmountValue amount={income + outcome} currency="GBP" />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollShadow>
    </>
  );
}
