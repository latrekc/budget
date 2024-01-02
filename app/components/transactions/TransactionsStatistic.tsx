"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useFragment } from "react-relay";
import AmountValue, { Size } from "../AmountValue";
import { TransactionsStatistic_statistic$key } from "./__generated__/TransactionsStatistic_statistic.graphql";

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
  statistic: statistic$key,
}: {
  statistic: TransactionsStatistic_statistic$key;
}) {
  const data = useFragment(
    graphql`
      fragment TransactionsStatistic_statistic on Query {
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

  return (
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
            <div className="flex flex-row flex-wrap text-right">
              {year.months.map(({ month, id, income, outcome }) => (
                <div key={id} className="basis-1/12 p-2">
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
                </div>
              ))}
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
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
