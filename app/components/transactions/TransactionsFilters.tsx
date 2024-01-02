import { Source } from "@/lib/types";
import { Input, Select, SelectItem, Switch } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useDebounce } from "usehooks-ts";
import SourceImage from "../SourceImage";
import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "./TransactionsFiltersReducer";
import { monthNames } from "./TransactionsStatistic";
import { TransactionsFilters_months$key } from "./__generated__/TransactionsFilters_months.graphql";

export default function TransactionsFilters({
  state,
  dispatch,
  months: months$key,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
  months: TransactionsFilters_months$key;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: ReducerActionType.toggleOnlyUncomplited }),
    [],
  );

  const sources = useMemo(() => {
    return Object.entries(Source);
  }, []);
  const onSourceSelect = useCallback((keys: Set<React.Key> | "all") => {
    if (keys instanceof Set) {
      dispatch({
        type: ReducerActionType.setSources,
        payload: [...keys.values()].map((key) => key.toString()),
      });
    } else {
      dispatch({ type: ReducerActionType.setSources, payload: null });
    }
  }, []);

  const { transactions_statistic_per_months: months } = useFragment(
    graphql`
      fragment TransactionsFilters_months on Query {
        transactions_statistic_per_months {
          id
          year
          month
        }
      }
    `,
    months$key,
  );

  const onMonthSelect = useCallback((keys: Set<React.Key> | "all") => {
    if (keys instanceof Set) {
      const values = [...keys.values()];

      dispatch({
        type: ReducerActionType.setMonth,
        payload: values.length > 0 ? values[0].toString() : null,
      });
    } else {
      dispatch({ type: ReducerActionType.setMonth, payload: null });
    }
  }, []);

  const [searchValue, setSearchValue] = useState<string>(state.search ?? "");
  const debouncedSearch = useDebounce<string>(searchValue, 500);

  const onSearch = useCallback((search: string) => setSearchValue(search), []);

  useEffect(() => {
    dispatch({
      type: ReducerActionType.setSearch,
      payload:
        debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : null,
    });
  }, [debouncedSearch]);

  return (
    <div className="flex flex-row flex-wrap gap-x-6 p-6">
      <Switch
        isSelected={state.onlyUncomplited}
        onValueChange={onOnlyUncomplitedToggle}
        size="sm"
      >
        Only uncategorised
      </Switch>

      <Input
        label="Search by description"
        className="w-auto"
        isClearable
        value={searchValue}
        onValueChange={onSearch}
      />

      <Select
        items={sources}
        label="Select source"
        className="max-w-xs"
        selectionMode="multiple"
        onSelectionChange={onSourceSelect}
        selectedKeys={state.sources != null ? state.sources : undefined}
      >
        {([value, label]) => (
          <SelectItem key={value} textValue={label}>
            <div className="flex flex-row gap-4">
              <SourceImage source={label} />
              <span>{label}</span>
            </div>
          </SelectItem>
        )}
      </Select>

      <Select
        items={months}
        label="Select month"
        className="max-w-xs"
        onSelectionChange={onMonthSelect}
        selectedKeys={state.month != null ? [state.month] : undefined}
      >
        {({ id, month, year }) => (
          <SelectItem key={id}>{`${year}, ${monthNames.get(
            month,
          )!}`}</SelectItem>
        )}
      </Select>
    </div>
  );
}
