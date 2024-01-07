import { useMemo } from "react";
import { graphql, useRefetchableFragment } from "react-relay";
import { TransactionsCategoriesContext } from "./TransactionsContext";
import { TransactionsCategories$key } from "./__generated__/TransactionsCategories.graphql";
import TransactionCategory from "./category/TransactionCategory";
import TransactionAddButton from "./category/buttons/TransactionCategoryAddButton";

export default function TransactionsCategories({
  categories: categories$key,
}: {
  categories: TransactionsCategories$key;
}) {
  const [{ categories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsCategories on Query
      @refetchable(queryName: "TransactionsCategoriesRefetchQuery") {
        categories {
          id
          parentCategory {
            __typename
          }
          ...TransactionCategory
        }
      }
    `,
    categories$key,
  );

  const refetchCategoriesValue = useMemo(
    () => ({
      refetchCategories: () => refetch({}, { fetchPolicy: "network-only" }),
    }),
    [],
  );

  return (
    <TransactionsCategoriesContext.Provider value={refetchCategoriesValue}>
      <div className="max-h-[720px] min-h-[720px] overflow-scroll bg-stone-50">
        <div className="p-4">
          <TransactionAddButton longLabel />
        </div>

        <div className="divide-y-small">
          {categories
            ?.filter((category) => category.parentCategory == null)
            .map((category) => (
              <TransactionCategory key={category.id} category={category} />
            ))}
        </div>
      </div>
    </TransactionsCategoriesContext.Provider>
  );
}
