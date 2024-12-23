"use client";

import {
  Accordion,
  AccordionItem,
  Badge,
  Checkbox,
  CheckboxGroup,
  Chip,
  Divider,
} from "@nextui-org/react";
import { Dispatch, useCallback, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";

import AmountValue, { Size } from "../AmountValue";
import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "./FiltersReducer";
import { FiltersMonths$key } from "./__generated__/FiltersMonths.graphql";

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
  [1, "January"],
  [2, "February"],
  [3, "March"],
  [4, "April"],
  [5, "May"],
  [6, "June"],
  [7, "July"],
  [8, "August"],
  [9, "September"],
  [10, "October"],
  [11, "November"],
  [12, "December"],
]);

enum YearSelectedMonthsState {
  ALL = "ALL",
  INDETERMINATE = "Indeterminate",
  NONE = "NONE",
}

export default function FiltersMonths({
  dispatch,
  filters,
  statistic: statistic$key,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
  statistic: FiltersMonths$key;
}) {
  const data = useFragment(
    graphql`
      fragment FiltersMonths on Query {
        transactionsStatisticPerMonths {
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

  const months = useMemo(
    () => data.transactionsStatisticPerMonths ?? [],
    [data.transactionsStatisticPerMonths],
  );

  const filterMonthsState = useMemo(
    () => (filters.months != null ? [...filters.months] : []),
    [filters.months],
  );

  const years: Result = useMemo(
    () =>
      months.reduce((accumulator: Result, currentValue) => {
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
      }, new Map()),
    [months],
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
    <div className="max-h-[720px] min-h-[720px] overflow-scroll">
      <ChipsComponent
        dispatch={dispatch}
        filterMonthsState={filterMonthsState}
        years={years}
      />
      <Accordion
        onSelectionChange={onSelectionChange}
        selectedKeys={selectedKeys}
        selectionBehavior="replace"
        selectionMode="single"
      >
        {[...years.entries()].map(([yearNumber, year]) => {
          const [selectedState, selectedCount] = getYearSelectedState(
            year,
            filterMonthsState,
          );

          return (
            <AccordionItem
              aria-label={yearNumber.toString()}
              classNames={{
                subtitle: "text-right",
                title: "flex w-full justify-between",
              }}
              key={yearNumber.toString()}
              subtitle={
                year.income !== 0 && year.outcome !== 0 ? (
                  <Balance income={year.income} outcome={year.outcome} />
                ) : null
              }
              title={
                <>
                  <Badge
                    color={
                      selectedState === YearSelectedMonthsState.ALL
                        ? "primary"
                        : "default"
                    }
                    content={selectedCount}
                    isInvisible={selectedState === YearSelectedMonthsState.NONE}
                    size="sm"
                    variant="flat"
                  >
                    <span className="text-2xl">{yearNumber}</span>
                  </Badge>
                  <AmountValue
                    amount={(year.income * 100 + year.outcome * 100) / 100}
                    currency="GBP"
                    round
                    size={Size.Big}
                  />
                </>
              }
            >
              <YearComponent
                dispatch={dispatch}
                filterMonthsState={filterMonthsState}
                key={yearNumber}
                year={year}
                yearNumber={yearNumber}
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function ChipsComponent({
  dispatch,
  filterMonthsState,
  years,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filterMonthsState: string[];
  years: Result;
}) {
  const onRemoveMonth = useCallback(
    (toRemove: string) => {
      const newValue = filterMonthsState.filter((item) => item !== toRemove);

      dispatch({
        payload: newValue.length ? newValue : null,
        type: FiltersReducerActionType.SetMonths,
      });
    },
    [dispatch, filterMonthsState],
  );

  const onRemoveYear = useCallback(
    (year: Year) => {
      const newValue = filterMonthsState.filter(
        (item) => !year.months.some(({ id }) => id === item),
      );

      dispatch({
        payload: newValue.length ? newValue : null,
        type: FiltersReducerActionType.SetMonths,
      });
    },
    [dispatch, filterMonthsState],
  );

  return filterMonthsState.length > 0 ? (
    <div className="inline-flex flex-wrap items-center justify-start gap-2">
      {[...years.entries()].map(([yearNumber, year]) => {
        switch (getYearSelectedState(year, filterMonthsState)[0]) {
          case YearSelectedMonthsState.NONE:
            return null;
          case YearSelectedMonthsState.ALL:
            return (
              <Chip
                color="primary"
                key={yearNumber}
                onClose={() => onRemoveYear(year)}
                variant="flat"
              >
                {yearNumber}
              </Chip>
            );
          case YearSelectedMonthsState.INDETERMINATE:
            return year.months.map(({ id, month }) =>
              filterMonthsState.includes(id) ? (
                <Chip key={id} onClose={() => onRemoveMonth(id)} variant="flat">
                  {monthNames.get(month)} {yearNumber}
                </Chip>
              ) : null,
            );
        }
      })}
    </div>
  ) : null;
}

function getYearSelectedState(year: Year, filterMonthsState: string[]) {
  const selected = year.months.filter(({ id }) =>
    filterMonthsState.includes(id),
  ).length;

  switch (selected) {
    case 0:
      return [YearSelectedMonthsState.NONE, 0];
    case year.months.length:
      return [YearSelectedMonthsState.ALL, selected];
    default:
      return [YearSelectedMonthsState.INDETERMINATE, selected];
  }
}

function YearComponent({
  dispatch,
  filterMonthsState,
  year,
  yearNumber,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filterMonthsState: string[];
  year: Year;
  yearNumber: number;
}) {
  const yearSelection = useMemo(
    () => getYearSelectedState(year, filterMonthsState)[0],
    [filterMonthsState, year],
  );

  const toggleSelectedYear = useCallback(
    (selected: boolean) => {
      let newValue = [...filterMonthsState];

      year.months.forEach(({ id }) => {
        if (selected) {
          if (!filterMonthsState.includes(id)) {
            newValue.push(id);
          }
        } else {
          newValue = newValue.filter((newId) => newId !== id);
        }
      });

      dispatch({
        payload: newValue,
        type: FiltersReducerActionType.SetMonths,
      });
    },
    [dispatch, filterMonthsState, year.months],
  );

  const setSelected = useCallback(
    (value: string[]) => {
      dispatch({
        payload: value.length > 0 ? value : null,
        type: FiltersReducerActionType.SetMonths,
      });
    },
    [dispatch],
  );

  return (
    <>
      <Checkbox
        className="m-0 mt-1 min-w-[100%] flex-none cursor-pointer gap-4 p-4 hover:bg-content2"
        isIndeterminate={
          yearSelection === YearSelectedMonthsState.INDETERMINATE
        }
        isSelected={yearSelection === YearSelectedMonthsState.ALL}
        key={yearNumber}
        onValueChange={toggleSelectedYear}
        value={yearNumber.toString()}
      >
        All months
      </Checkbox>

      <Divider />

      <CheckboxGroup onValueChange={setSelected} value={filterMonthsState}>
        {year.months.map(({ id, income, month, outcome }) => (
          <Checkbox
            classNames={{
              base: "m-0 mt-1 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary",
              label: "w-full",
            }}
            key={id}
            value={id}
          >
            <div className="flex justify-between text-xl">
              {monthNames.get(month)}
              <AmountValue
                amount={(income * 100 + outcome * 100) / 100}
                currency="GBP"
                round
                size={Size.Big}
              />
            </div>

            <div className="text-right">
              <Balance income={income} outcome={outcome} />
            </div>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </>
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
