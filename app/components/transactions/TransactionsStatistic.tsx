"use client";

import { Accordion, AccordionItem, Radio, RadioGroup } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import AmountValue, { Size } from "../AmountValue";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "./TransactionsFiltersReducer";
import { TransactionsStatistic$key } from "./__generated__/TransactionsStatistic.graphql";

type Year = {
  income: number;
  outcome: number;
  months: {
    id: string;
    year: number;
    month: number;
    income: number;
    outcome: number;
  }[];
};
type Result = Map<number, Year>;

export const monthNames = new Map([
  [1, "Jan"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Apr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Aug"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"],
  [12, "Dec"],
]);

export default function TransactionsStatistic({
  filters,
  dispatch,
  statistic: statistic$key,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
  statistic: TransactionsStatistic$key;
}) {
  const data = useFragment(
    graphql`
      fragment TransactionsStatistic on Query {
        transactions_statistic_per_months {
          id
          year
          month
          income
          outcome
        }
      }
    `,
    statistic$key,
  );

  const years: Result =
    data == null || data.transactions_statistic_per_months == null
      ? new Map()
      : data.transactions_statistic_per_months.reduce(
          (accumulator: Result, currentValue) => {
            let year = accumulator.get(currentValue.year);

            if (year == undefined) {
              year = {
                months: [],
                income: 0,
                outcome: 0,
              };
              accumulator.set(currentValue.year, year);
            }

            year.months.push(currentValue);
            year.income += currentValue.income;
            year.outcome += currentValue.outcome;
            return accumulator;
          },
          new Map(),
        );

  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    [...years.keys()][0]?.toString(),
  ]);
  const onSelectionChange = useCallback((keys: "all" | Set<React.Key>) => {
    if (keys instanceof Set) {
      setSelectedKeys([...keys.values()].map((k) => k.toString()));
    }

    return keys;
  }, []);

  const onMonthChange = useCallback((value: string) => {
    dispatch({
      type: ReducerActionType.setMonth,
      payload: value,
    });
  }, []);

  const value = useMemo(() => filters.month ?? undefined, [filters.month]);

  return (
    <RadioGroup value={value} onValueChange={onMonthChange}>
      <Accordion
        onSelectionChange={onSelectionChange}
        selectedKeys={selectedKeys}
        selectionBehavior="replace"
        selectionMode="single"
      >
        {[...years.keys()].map((yearNumber) => {
          const year = years.get(yearNumber)!;

          return (
            <AccordionItem
              key={yearNumber.toString()}
              aria-label={yearNumber.toString()}
              subtitle={<Balance income={year.income} outcome={year.outcome} />}
              title={
                <>
                  <span className="text-2xl">{yearNumber}</span>{" "}
                  <AmountValue
                    amount={(year.income * 100 + year.outcome * 100) / 100}
                    currency="GBP"
                    round
                    size={Size.Big}
                  />
                </>
              }
            >
              {year.months.map(({ month, id, income, outcome }) => (
                <Radio
                  key={id}
                  value={id}
                  className="m-0 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
                >
                  <div className="text-xl">
                    {monthNames.get(month)}{" "}
                    <AmountValue
                      amount={(income * 100 + outcome * 100) / 100}
                      currency="GBP"
                      round
                      size={Size.Big}
                    />
                  </div>
                  <Balance income={income} outcome={outcome} />
                </Radio>
              ))}
            </AccordionItem>
          );
        })}
      </Accordion>
    </RadioGroup>
  );
}

function Balance({ income, outcome }: { income: number; outcome: number }) {
  return (
    <>
      <AmountValue amount={income} currency="GBP" round size={Size.Small} />
      {" - "}
      <AmountValue
        amount={outcome}
        currency="GBP"
        round
        abs
        size={Size.Small}
      />
    </>
  );
}
