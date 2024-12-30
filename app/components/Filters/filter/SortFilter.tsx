import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import { SortBy } from "@/lib/types";
import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../FiltersReducer";

export default function SortFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const onSortByToggle = useCallback(
    () => dispatch({ type: FiltersReducerActionType.ToggleSortBy }),
    [dispatch],
  );

  return (
    <Switch
      isSelected={filters.sortBy === SortBy.Amount}
      onValueChange={onSortByToggle}
      size="sm"
    >
      Sort by amount
    </Switch>
  );
}
