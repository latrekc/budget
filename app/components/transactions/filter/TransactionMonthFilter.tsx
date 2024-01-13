import { Chip } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionMonthFilter({
  filters,
  dispatch,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const onRemove = useCallback(
    () => dispatch({ type: ReducerActionType.setMonth, payload: null }),
    [],
  );

  return (
    filters.month && (
      <div className="inline-flex items-center justify-start">
        <Chip onClose={onRemove} variant="flat">
          {filters.month}
        </Chip>
      </div>
    )
  );
}
