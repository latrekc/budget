import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionComplitedFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: ReducerActionType.toggleOnlyUncomplited }),
    [dispatch],
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
