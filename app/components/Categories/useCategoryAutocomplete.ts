import { useDeferredPromise } from "@/lib/useDeferredPromise";
import { useEffect } from "react";
import { PreloadedQuery, useQueryLoader } from "react-relay";
import { CategoryAutocompleteQuery } from "./CategoryAutocomplete";
import { CategoryAutocompleteQuery as CategoryAutocompleteQueryType } from "./__generated__/CategoryAutocompleteQuery.graphql";

export default function useCategoryAutocomplete() {
  const [preloadedQuery, loadQuery] =
    useQueryLoader<CategoryAutocompleteQueryType>(CategoryAutocompleteQuery);

  const { defer, deferRef } =
    useDeferredPromise<PreloadedQuery<CategoryAutocompleteQueryType>>();

  useEffect(() => {
    loadQuery({});
  }, [loadQuery]);

  if (preloadedQuery == null) {
    if (!deferRef) {
      throw defer().promise;
    } else {
      throw deferRef.promise;
    }
  } else {
    deferRef?.resolve(preloadedQuery);
  }

  return { preloadedQuery };
}
