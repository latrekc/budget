import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useDeferredValue, useEffect } from "react";
import { useQueryLoader } from "react-relay";
import { CategoryAutocompleteQuery } from "./CategoryAutocomplete";
import { CategoryAutocompleteQuery as CategoryAutocompleteQueryType } from "./__generated__/CategoryAutocompleteQuery.graphql";

export default function useCategoryAutocomplete() {
  const [preloadedQuery, loadQuery] =
    useQueryLoader<CategoryAutocompleteQueryType>(CategoryAutocompleteQuery);
  const deferredQuery = useDeferredValue(preloadedQuery);

  const { subscribe } = usePubSub();

  useEffect(() => {
    if (preloadedQuery === null) {
      loadQuery({});
    }
    return subscribe(PubSubChannels.Categories, () => {
      loadQuery({}, { networkCacheConfig: { force: true } });
    });
  }, [loadQuery, preloadedQuery, subscribe]);

  return { preloadedQuery: deferredQuery };
}
