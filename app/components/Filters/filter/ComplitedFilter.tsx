import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../FiltersReducer";

export default function ComplitedFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: FiltersReducerActionType.ToggleOnlyUncomplited }),
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
