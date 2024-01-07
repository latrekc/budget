import { graphql, useFragment } from "react-relay";
import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { TransactionCategoriesCell$key } from "./__generated__/TransactionCategoriesCell.graphql";
import TransactionCellDeleteCategoryButton from "./buttons/TransactionCellDeleteCategoryButton";

export default function TransactionCategoriesCell({
  transaction: transaction$key,
}: {
  transaction: TransactionCategoriesCell$key;
}) {
  const { completed, categories, currency } = useFragment(
    graphql`
      fragment TransactionCategoriesCell on Transaction {
        completed
        amount
        currency
        categories {
          category {
            id
            ...TransactionCategoryChip
          }
          amount
          ...TransactionCellDeleteCategoryButton
        }
      }
    `,
    transaction$key,
  );

  return (
    <div className="flex shrink flex-row flex-wrap">
      {categories.map((record) => (
        <div key={record.category.id} className="p-1">
          <TransactionCategoryChip
            category={record.category}
            currency={currency}
            amount={categories.length > 1 || !completed ? record.amount : null}
            button={<TransactionCellDeleteCategoryButton record={record} />}
          />
        </div>
      ))}
    </div>
  );
}
