import { Input } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionAmountFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const [amountValue, setAmountValue] = useState<string>(filters.amount ?? "");
  const debouncedAmount = useDebounce<string>(amountValue, 500);

  const onSearch = useCallback((amount: string) => setAmountValue(amount), []);

  useEffect(() => {
    dispatch({
      payload:
        debouncedAmount.trim().length > 0 ? debouncedAmount.trim() : null,
      type: ReducerActionType.setAmount,
    });
  }, [debouncedAmount, dispatch]);

  return (
    <Input
      className="w-auto"
      isClearable
      label="Search by amount"
      onValueChange={onSearch}
      type="number"
      value={amountValue}
    />
  );
}
