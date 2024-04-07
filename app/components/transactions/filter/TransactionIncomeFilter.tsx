import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../TransactionsFiltersReducer";

export default function TransactionIncomeFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const onOnlyIncomeToggle = useCallback(
    () => dispatch({ type: FiltersReducerActionType.toggleOnlyIncome }),
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
