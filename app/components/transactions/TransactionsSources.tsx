import { Source } from "@/lib/types";
import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { Dispatch, useCallback, useMemo } from "react";
import SourceImage from "../SourceImage";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "./TransactionsFiltersReducer";

export default function TransactionsSources({
  filters,
  dispatch,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const sources = useMemo(() => {
    return Object.entries(Source);
  }, []);

  const setSelected = useCallback((value: string[]) => {
    dispatch({
      type: ReducerActionType.setSources,
      payload: value.length > 0 && value.length < sources.length ? value : null,
    });
  }, []);

  const value = useMemo(
    () => (filters.sources != null ? [...filters.sources] : []),
    [filters.sources],
  );

  return (
    <CheckboxGroup value={value} onValueChange={setSelected}>
      {sources.map(([id, label]) => (
        <Checkbox
          key={id}
          value={id}
          className="m-0 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
        >
          <div className="flex flex-row gap-4 text-xl">
            <SourceImage source={label} />
            <span>{label}</span>
          </div>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
