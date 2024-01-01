import { graphql, useFragment } from "react-relay";
import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { TransactionCategoriesCell__transaction$key } from "./__generated__/TransactionCategoriesCell__transaction.graphql";

export default function TransactionCategoriesCell({
  transaction: transaction$key,
}: {
  transaction: TransactionCategoriesCell__transaction$key;
}) {
  const { completed, categories, currency } = useFragment(
    graphql`
      fragment TransactionCategoriesCell__transaction on Transaction {
        completed
        amount
        currency
        categories {
          category {
            id
            ...TransactionCategoryChip_category
          }
          amount
        }
      }
    `,
    transaction$key,
  );

  return (
    <div className="flex shrink flex-row flex-wrap">
      {categories.map(({ category, amount }) => (
        <div key={category.id} className="p-1">
          <TransactionCategoryChip
            category={category}
            currency={currency}
            amount={categories.length > 1 ? amount : null}
          />
        </div>
      ))}
    </div>
  );
}
