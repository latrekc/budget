import { Chip } from "@nextui-org/react";
import { Dispatch, useCallback } from "react";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionMonthFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const onRemove = useCallback(
    () => dispatch({ payload: null, type: ReducerActionType.setMonth }),
    [dispatch],
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
