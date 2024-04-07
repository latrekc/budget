import { Input } from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
} from "../TransactionsFiltersReducer";

export default function TransactionDescriptionFilter({
  dispatch,
  filters,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
}) {
  const [searchValue, setSearchValue] = useState<string>(filters.search ?? "");
  const debouncedSearch = useDebounce<string>(searchValue, 500);

  const onSearch = useCallback((search: string) => setSearchValue(search), []);

  useEffect(() => {
    dispatch({
      payload: debouncedSearch.length > 0 ? debouncedSearch : null,
      type: FiltersReducerActionType.setSearch,
    });
  }, [debouncedSearch, dispatch]);

  return (
    <Input
      className="mr-6 w-auto grow"
      isClearable
      label="Search by description"
      labelPlacement="outside"
      onValueChange={onSearch}
      value={searchValue}
    />
  );
}
