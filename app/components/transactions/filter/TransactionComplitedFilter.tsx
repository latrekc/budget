import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "../TransactionsFiltersReducer";

import { Switch } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

export default function TransactionComplitedFilter({
  state,
  dispatch,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const onOnlyUncomplitedToggle = useCallback(
    () => dispatch({ type: ReducerActionType.toggleOnlyUncomplited }),
    [],
  );
  return (
    <Switch
      isSelected={state.onlyUncomplited}
      onValueChange={onOnlyUncomplitedToggle}
      size="sm"
    >
      Only uncategorised
    </Switch>
  );
}
