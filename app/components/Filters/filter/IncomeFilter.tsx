import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../FiltersReducer";

export default function IncomeFilter({
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
