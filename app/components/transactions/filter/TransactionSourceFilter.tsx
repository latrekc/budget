import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

import { Chip } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

export default function TransactionComplitedFilter({
  filters,
  dispatch,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const onRemove = useCallback(
    (toRemove: string) => {
      const newValue = filters.sources!.filter((item) => item !== toRemove);

      dispatch({
        type: ReducerActionType.setSources,
        payload: newValue.length ? newValue : null,
      });
    },
    [filters.sources],
  );

  return (
    <div className="inline-flex items-center justify-start gap-x-3">
      {filters.sources?.map((source) => (
        <Chip key={source} variant="flat" onClose={() => onRemove(source)}>
          {source}
        </Chip>
      ))}
    </div>
  );
}
