import { Source } from "@/lib/types";
import { Select, SelectItem, Switch } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo } from "react";
import SourceImage from "../SourceImage";
import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "./TransactionsFiltersReducer";

export default function TransactionsFilters({
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

  const sources = useMemo(() => {
    return Object.entries(Source);
  }, []);
  const onSourceSelect = useCallback((keys: Set<React.Key> | "all") => {
    if (keys instanceof Set) {
      dispatch({
        type: ReducerActionType.setSources,
        payload: [...keys.values()].map((key) => key.toString()),
      });
    } else {
      dispatch({ type: ReducerActionType.setSources, payload: null });
    }
  }, []);

  return (
    <div className="flex flex-row flex-wrap gap-x-6 p-6">
      <Switch
        isSelected={state.onlyUncomplited}
        onValueChange={onOnlyUncomplitedToggle}
        size="sm"
      >
        Only uncategorised
      </Switch>

      <Select
        items={sources}
        label="Select source"
        className="max-w-xs"
        selectionMode="multiple"
        onSelectionChange={onSourceSelect}
        selectedKeys={state.sources ?? "all"}
      >
        {([value, label]) => (
          <SelectItem key={value} textValue={label}>
            <div className="flex flex-row gap-4">
              <SourceImage source={label} />
              <span>{label}</span>
            </div>
          </SelectItem>
        )}
      </Select>
    </div>
  );
}
