import { graphql, useFragment } from "react-relay";

import { TransactionCategoriesButtonCell$key } from "./__generated__/TransactionCategoriesButtonCell.graphql";
import TransactionCellAddCategoryButton from "./buttons/TransactionCellAddCategoryButton";
import TransactionCellSplitCategoryButton from "./buttons/TransactionCellSplitCategoryButton";

export default function TransactionCategoriesButtonCell({
  transaction: transaction$key,
}: {
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
      }
    `,
    transaction$key,
  );

  return transaction.categories.length > 0 ? (
    <TransactionCellSplitCategoryButton transaction={transaction} />
  ) : (
    <TransactionCellAddCategoryButton transaction={transaction} />
  );
}
