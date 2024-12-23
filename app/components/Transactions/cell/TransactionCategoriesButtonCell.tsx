import { graphql, useFragment } from "react-relay";

import { TransactionCategoriesButtonCell$key } from "./__generated__/TransactionCategoriesButtonCell.graphql";
import { TransactionCategoriesButtonCell_Categories$key } from "./__generated__/TransactionCategoriesButtonCell_Categories.graphql";
import TransactionCellAddCategoryButton from "./buttons/TransactionCellAddCategoryButton";
import TransactionCellSplitCategoryButton from "./buttons/TransactionCellSplitCategoryButton";

export default function TransactionCategoriesButtonCell({
  categories: categories$key,
  transaction: transaction$key,
}: {
  categories: TransactionCategoriesButtonCell_Categories$key;
  transaction: TransactionCategoriesButtonCell$key;
}) {
  const transaction = useFragment(
    graphql`
      fragment TransactionCategoriesButtonCell on Transaction {
        ...TransactionCellSplitCategoryButton
        ...TransactionCellAddCategoryButton
        categories @required(action: THROW) {
          __typename
        }
        amount
      }
    `,
    transaction$key,
  );

  const categories = useFragment(
    graphql`
      fragment TransactionCategoriesButtonCell_Categories on Query {
        ...TransactionCellAddCategoryButton_Categories
        ...TransactionCellSplitCategoryButton_Categories
      }
    `,
    categories$key,
  );

  if (transaction.amount === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {transaction.categories.length === 0 ? (
        <TransactionCellAddCategoryButton
          categories={categories}
          transaction={transaction}
        />
      ) : null}
      <TransactionCellSplitCategoryButton
        categories={categories}
        transaction={transaction}
      />
    </div>
  );
}
