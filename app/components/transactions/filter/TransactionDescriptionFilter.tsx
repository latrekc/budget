import { Input } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";

export default function TransactionDescriptionFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const [searchValue, setSearchValue] = useState<string>(filters.search ?? "");
  const debouncedSearch = useDebounce<string>(searchValue, 500);

  const onSearch = useCallback((search: string) => setSearchValue(search), []);

  useEffect(() => {
    dispatch({
      payload:
        debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : null,
      type: ReducerActionType.setSearch,
    });
  }, [debouncedSearch, dispatch]);

  return (
    <Input
      className="mr-6 w-auto grow"
      isClearable
      label="Search by description"
      onValueChange={onSearch}
      value={searchValue}
    />
  );
}
