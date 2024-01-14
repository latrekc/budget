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
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const sources = useMemo(() => {
    return Object.entries(Source);
  }, []);

  const setSelected = useCallback(
    (value: string[]) => {
      dispatch({
        payload:
          value.length > 0 && value.length < sources.length ? value : null,
        type: ReducerActionType.setSources,
      });
    },
    [dispatch, sources.length],
  );

  const value = useMemo(
    () => (filters.sources != null ? [...filters.sources] : []),
    [filters.sources],
  );

  return (
    <CheckboxGroup onValueChange={setSelected} value={value}>
      {sources.map(([id, label]) => (
        <Checkbox
          className="m-0 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
          key={id}
          value={id}
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
