import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../TransactionsFiltersReducer";

export default function TransactionComplitedFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: FiltersReducerActionType.toggleOnlyUncomplited }),
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
