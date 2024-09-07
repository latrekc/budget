import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer } from "react";

import { AmountRelation, enumFromStringValue } from "@/lib/types";
import TransactionsFiltersReducer, { initialState } from "./FiltersReducer";

export default function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filtersInitialState = useMemo(() => {
    const params = new URLSearchParams(searchParams);

    const state = {
      ...initialState,
    };

    if (params.has("onlyIncome")) {
      state.onlyIncome = true;
    }

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
    if (params.has("ignoreCategories")) {
      state.ignoreCategories = params
        .get("ignoreCategories")!
        .split(",")
        .filter((str) => str.length > 0);
    }

    if (params.has("months")) {
      state.months = params
        .get("months")!
        .split(",")
        .filter((str) => str.length > 0);
    }

    if (params.has("search")) {
      state.search = decodeURIComponent(params.get("search")!);
    }

    if (params.has("amount")) {
      state.amount = decodeURIComponent(params.get("amount")!);
    }

    if (params.has("amountRelation")) {
      state.amountRelation = enumFromStringValue<AmountRelation>(
        AmountRelation,
        decodeURIComponent(params.get("amountRelation")!),
      );
    }

    return state;
  }, [searchParams]);

  const [filtersState, dispatch] = useReducer(
    TransactionsFiltersReducer,
    filtersInitialState,
  );

  const statisticFiltersState = useMemo(
    () => ({
      categories: filtersState.categories,
      ignoreCategories: filtersState.ignoreCategories,
      months: filtersState.months,
      onlyIncome: filtersState.onlyIncome,
    }),
    [filtersState],
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (filtersState.onlyIncome) {
      params.set("onlyIncome", "true");
    } else {
      params.delete("onlyIncome");
    }

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
    if (
      filtersState.ignoreCategories != null &&
      filtersState.ignoreCategories.length > 0
    ) {
      params.set("ignoreCategories", filtersState.ignoreCategories.join(","));
    } else {
      params.delete("ignoreCategories");
    }

    if (filtersState.months != null) {
      params.set("months", filtersState.months.join(","));
    } else {
      params.delete("months");
    }

    if (filtersState.search != null) {
      params.set("search", encodeURIComponent(filtersState.search));
    } else {
      params.delete("search");
    }
    if (filtersState.amount != null) {
      params.set("amount", encodeURIComponent(filtersState.amount));
    } else {
      params.delete("amount");
    }
    if (filtersState.amountRelation != null) {
      params.set(
        "amountRelation",
        encodeURIComponent(filtersState.amountRelation),
      );
    } else {
      params.delete("amountRelation");
    }

    router.replace(`${pathname}?${params}`);
  }, [filtersState, pathname, router, searchParams]);

  return { dispatch, filtersState, statisticFiltersState };
}
