import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionIncomeFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const onOnlyIncomeToggle = useCallback(
    () => dispatch({ type: ReducerActionType.toggleOnlyIncome }),
    [dispatch],
  );

  return (
    <Switch
      isSelected={filters.onlyIncome}
      onValueChange={onOnlyIncomeToggle}
      size="sm"
    >
      Only income
    </Switch>
  );
}
