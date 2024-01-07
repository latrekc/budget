import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "../TransactionsFiltersReducer";

import { Source } from "@/lib/types";
import { Select, SelectItem } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo } from "react";
import SourceImage from "../../SourceImage";

export default function TransactionComplitedFilter({
  state,
  dispatch,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
}) {
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
    <Select
      items={sources}
      label="Search by source"
      className="max-w-xs"
      selectionMode="multiple"
      onSelectionChange={onSourceSelect}
      selectedKeys={state.sources != null ? state.sources : undefined}
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
  );
}
