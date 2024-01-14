import { Chip } from "@nextui-org/react";
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
  const onRemove = useCallback(
    (toRemove: string) => {
      const newValue = filters.sources!.filter((item) => item !== toRemove);

      dispatch({
        payload: newValue.length ? newValue : null,
        type: ReducerActionType.setSources,
      });
    },
    [dispatch, filters.sources],
  );

  return (
    <div className="inline-flex items-center justify-start gap-x-3">
      {filters.sources?.map((source) => (
        <Chip key={source} onClose={() => onRemove(source)} variant="flat">
          {source}
        </Chip>
      ))}
    </div>
  );
}
