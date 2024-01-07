import { Input } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import {
  ReducerAction,
  ReducerActionType,
  ReducerState,
} from "../TransactionsFiltersReducer";

export default function TransactionDescriptionFilter({
  state,
  dispatch,
}: {
  state: ReducerState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const [searchValue, setSearchValue] = useState<string>(state.search ?? "");
  const debouncedSearch = useDebounce<string>(searchValue, 500);

  const onSearch = useCallback((search: string) => setSearchValue(search), []);

  useEffect(() => {
    dispatch({
      type: ReducerActionType.setSearch,
      payload:
        debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : null,
    });
  }, [debouncedSearch]);

  return (
    <Input
      label="Search by description"
      className="w-auto"
      isClearable
      value={searchValue}
      onValueChange={onSearch}
    />
  );
}
