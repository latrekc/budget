import { Selection } from "@nextui-org/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionsCategories from "./TransactionsCategories";
import TransactionsFilters from "./TransactionsFilters";
import TransactionsFiltersReducer, {
  initialState,
} from "./TransactionsFiltersReducer";
import TransactionsStatistic from "./TransactionsStatistic";
import TransactionsTable, { PER_PAGE } from "./TransactionsTable";
import { TransactionsQuery } from "./__generated__/TransactionsQuery.graphql";

export default function Transactions() {
  const [selectedTransactions, setSelectedTransactions] = useState<Selection>(
    new Set([]),
  );

  useEffect(() => {
    console.log("selectedTransactions", selectedTransactions);
  }, [selectedTransactions]);

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

    if (params.has("month")) {
      state.month = params.get("month")!;
    }

    if (params.has("search")) {
      state.search = decodeURIComponent(params.get("search")!);
    }

    return state;
  }, []);

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
  }, [filtersState]);

  const data = useLazyLoadQuery<TransactionsQuery>(
    graphql`
      query TransactionsQuery(
        $first: Int
        $after: ID
        $filters: filterTransactionsInput
      ) {
        ...TransactionsTable
        ...TransactionsStatistic
        ...TransactionsCategories
        ...TransactionsFilters
      }
    `,
    { first: PER_PAGE, filters: filtersState },
  );

  return (
    <>
      <TransactionsFilters
        state={filtersState}
        dispatch={dispatch}
        months={data}
      />

      <div className="flex flex-row">
        <div className="basis-3/4">
          <TransactionsTable
            transactions={data}
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
          />
        </div>

        <div className="basis-1/4">
          <TransactionsCategories categories={data} />
        </div>
      </div>

      <TransactionsStatistic statistic={data} />
    </>
  );
}
