import { Select, SelectItem } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";
import { graphql, useFragment } from "react-relay";
import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "../TransactionsFiltersReducer";
import { monthNames } from "../TransactionsStatistic";
import { TransactionMonthFilter$key } from "./__generated__/TransactionMonthFilter.graphql";

export default function TransactionMonthFilter({
  state,
  dispatch,
  months: months$key,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
  months: TransactionMonthFilter$key;
}) {
  const { transactions_statistic_per_months: months } = useFragment(
    graphql`
      fragment TransactionMonthFilter on Query {
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

  return (
    <Select
      items={months}
      label="Select month"
      className="max-w-xs"
      onSelectionChange={onMonthSelect}
      selectedKeys={state.month != null ? [state.month] : undefined}
    >
      {({ id, month, year }) => (
        <SelectItem key={id}>{`${year}, ${monthNames.get(month)!}`}</SelectItem>
      )}
    </Select>
  );
}
