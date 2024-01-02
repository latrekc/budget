import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer } from "react";
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
      state.sources = params.get("sources")!.split(",");
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

    if (filtersState.sources != null) {
      params.set("sources", filtersState.sources.join(","));
    } else {
      params.delete("sources");
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
        ...TransactionsTable_transactions
        ...TransactionsStatistic_statistic
        ...TransactionsCategories_categories
      }
    `,
    { first: PER_PAGE, filters: filtersState },
  );

  return (
    <>
      <TransactionsFilters state={filtersState} dispatch={dispatch} />

      <div className="flex flex-row">
        <div className="basis-3/4">
          <TransactionsTable transactions={data} />
        </div>

        <div className="basis-1/4">
          <TransactionsCategories categories={data} />
        </div>
      </div>

      <TransactionsStatistic statistic={data} />
    </>
  );
}
