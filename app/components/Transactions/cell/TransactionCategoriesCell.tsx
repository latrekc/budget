import { graphql, useFragment } from "react-relay";

import CategoryChip from "../../Categories/CategoryChip";
import {
  Currency,
  TransactionCategoriesCell$key,
} from "./__generated__/TransactionCategoriesCell.graphql";
import { TransactionCategoriesCell_Category$key } from "./__generated__/TransactionCategoriesCell_Category.graphql";
import useTransactionCellDeleteCategoryButton from "./buttons/useTransactionCellDeleteCategoryButton";

export default function TransactionCategoriesCell({
  transaction: transaction$key,
}: {
  transaction: TransactionCategoriesCell$key;
}) {
  const { categories, completed, currency } = useFragment(
    graphql`
      fragment TransactionCategoriesCell on Transaction {
        completed @required(action: THROW)
        quantity @required(action: THROW)
        currency @required(action: THROW)
        categories @required(action: THROW) {
          category {
            id
          }
          ...TransactionCategoriesCell_Category
          quantity @required(action: THROW)
        }
      }
    `,
    transaction$key,
  );

  return (
    <div className="flex shrink flex-row flex-wrap">
      {categories?.map((record) => (
        <div className="p-1" key={record?.category?.id}>
          <Category
            currency={currency}
            quantity={
              categories.length > 1 || !completed ? record.quantity : null
            }
            record={record}
          />
        </div>
      ))}
    </div>
  );
}
function Category({
  currency,
  quantity,
  record: record$key,
}: {
  currency: Currency;
  quantity: null | number;
  record: TransactionCategoriesCell_Category$key;
}) {
  const record = useFragment(
    graphql`
      fragment TransactionCategoriesCell_Category on TransactionsOnCategories {
        category @required(action: THROW) {
          ...CategoryChip
        }
        ...useTransactionCellDeleteCategoryButton
      }
    `,
    record$key,
  );

  const { isDisabledDelete, onDelete } =
    useTransactionCellDeleteCategoryButton(record);

  return (
    <CategoryChip
      category={record.category}
      currency={currency}
      isDisabledDelete={isDisabledDelete}
      onDelete={onDelete}
      quantity={quantity}
    />
  );
}
