import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

export default function TransactionComplitedFilter({
  filters,
  dispatch,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: ReducerActionType.toggleOnlyUncomplited }),
    [],
  );

  return (
    <Switch
      isSelected={filters.onlyUncomplited}
      onValueChange={onOnlyUncomplitedToggle}
      size="sm"
    >
      Only uncategorised
    </Switch>
  );
}
