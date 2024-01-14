"use client";

import { Accordion, AccordionItem, Radio, RadioGroup } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";

import AmountValue, { Size } from "../AmountValue";
import { TransactionsStatistic$key } from "./__generated__/TransactionsStatistic.graphql";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "./TransactionsFiltersReducer";

type Year = {
  income: number;
  months: {
    id: string;
    income: number;
    month: number;
    outcome: number;
    year: number;
  }[];
  outcome: number;
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
  dispatch,
  filters,
  statistic: statistic$key,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
  statistic: TransactionsStatistic$key;
}) {
  const data = useFragment(
    graphql`
      fragment TransactionsStatistic on Query {
        transactions_statistic_per_months {
          id @required(action: THROW)
          year @required(action: THROW)
          month @required(action: THROW)
          income @required(action: THROW)
          outcome @required(action: THROW)
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
                income: 0,
                months: [],
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

  const onMonthChange = useCallback(
    (value: string) => {
      dispatch({
        payload: value,
        type: ReducerActionType.setMonth,
      });
    },
    [dispatch],
  );

  const value = useMemo(() => filters.month ?? undefined, [filters.month]);

  return (
    <RadioGroup onValueChange={onMonthChange} value={value}>
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
              aria-label={yearNumber.toString()}
              key={yearNumber.toString()}
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
              {year.months.map(({ id, income, month, outcome }) => (
                <Radio
                  className="m-0 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
                  key={id}
                  value={id}
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
        abs
        amount={outcome}
        currency="GBP"
        round
        size={Size.Small}
      />
    </>
  );
}
