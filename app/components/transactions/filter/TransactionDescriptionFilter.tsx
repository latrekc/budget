import { Input } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionDescriptionFilter({
  filters,
  dispatch,
}: {
  filters: FiltersState;
  dispatch: Dispatch<ReducerAction>;
}) {
  const [searchValue, setSearchValue] = useState<string>(filters.search ?? "");
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
