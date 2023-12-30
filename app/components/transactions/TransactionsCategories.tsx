import { useCallback } from "react";
import { graphql, useRefetchableFragment } from "react-relay";
import { TransactionsCategories_categories$key } from "./__generated__/TransactionsCategories_categories.graphql";
import TransactionAddButton from "./category/TransactionAddButton";
import TransactionCategory from "./category/TransactionCategory";

export default function TransactionsCategories({
  categories: categories$key,
}: {
  categories: TransactionsCategories_categories$key;
}) {
  const [{ categories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsCategories_categories on Query
      @refetchable(queryName: "TransactionsCategoriesRefetchQuery") {
        categories {
          id
          parentCategory {
            __typename
          }
          ...TransactionCategory_category
        }
      }
    `,
    categories$key,
  );

  const onUpdate = useCallback(() => {
    refetch({}, { fetchPolicy: "network-only" });
  }, []);

  return (
    <div className="max-h-[720px] min-h-[720px] overflow-scroll bg-stone-50">
      <div className="divide-y-small">
        {categories
          ?.filter((category) => category.parentCategory == null)
          .map((category) => (
            <TransactionCategory
              key={category.id}
              category={category}
              onUpdate={onUpdate}
            />
          ))}
      </div>
      <TransactionAddButton onUpdate={onUpdate} />
    </div>
  );
}
