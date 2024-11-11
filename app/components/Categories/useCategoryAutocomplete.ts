import { useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";
import { CategoryAutocompleteQuery } from "./CategoryAutocomplete";
import { CategoryAutocompleteQuery as CategoryAutocompleteQueryType } from "./__generated__/CategoryAutocompleteQuery.graphql";

export default function useCategoryAutocomplete() {
  const [preloadedQuery, loadQuery] =
    useQueryLoader<CategoryAutocompleteQueryType>(CategoryAutocompleteQuery);
  const deferredQuery = useDeferredValue(preloadedQuery);

  useEffect(() => {
    if (preloadedQuery === null) {
      loadQuery({});
    }
  }, [loadQuery, preloadedQuery]);

  return { preloadedQuery: deferredQuery };
}
