import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer } from "react";

import TransactionsFiltersReducer, {
  initialState,
} from "./TransactionsFiltersReducer";

export default function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filtersInitialState = useMemo(() => {
    const params = new URLSearchParams(searchParams);

    const state = {
      ...initialState,
    };

    if (params.has("onlyUncomplited")) {
      state.onlyUncomplited = true;
    }

    if (params.has("sources")) {
      state.sources = params
        .get("sources")!
        .split(",")
        .filter((str) => str.length > 0);
    }
    if (params.has("categories")) {
      state.categories = params
        .get("categories")!
        .split(",")
        .filter((str) => str.length > 0);
    }

    if (params.has("month")) {
      state.month = params.get("month")!;
    }

    if (params.has("search")) {
      state.search = decodeURIComponent(params.get("search")!);
    }

    return state;
  }, [searchParams]);

  const [filtersState, dispatch] = useReducer(
    TransactionsFiltersReducer,
    filtersInitialState,
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (filtersState.onlyUncomplited) {
      params.set("onlyUncomplited", "true");
    } else {
      params.delete("onlyUncomplited");
    }

    if (filtersState.sources != null && filtersState.sources.length > 0) {
      params.set("sources", filtersState.sources.join(","));
    } else {
      params.delete("sources");
    }

    if (filtersState.categories != null && filtersState.categories.length > 0) {
      params.set("categories", filtersState.categories.join(","));
    } else {
      params.delete("categories");
    }

    if (filtersState.month != null) {
      params.set("month", filtersState.month);
    } else {
      params.delete("month");
    }

    if (filtersState.search != null) {
      params.set("search", encodeURIComponent(filtersState.search));
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params}`);
  }, [filtersState, pathname, router, searchParams]);

  return { dispatch, filtersState };
}