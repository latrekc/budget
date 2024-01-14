import { graphql, useFragment } from "react-relay";

import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { Currency } from "../cell/__generated__/TransactionAmountCell__transactio.graphql";
import { TransactionCategoriesCell$key } from "./__generated__/TransactionCategoriesCell.graphql";
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
        amount @required(action: THROW)
        currency @required(action: THROW)
        categories @required(action: THROW) {
          category {
            id
          }
          ...TransactionCategoriesCell_Category
          amount @required(action: THROW)
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
            amount={categories.length > 1 || !completed ? record.amount : null}
            currency={currency}
            record={record}
          />
        </div>
      ))}
    </div>
  );
}
function Category({
  amount,
  currency,
  record: record$key,
}: {
  amount: null | number;
  currency: Currency;
  record: TransactionCategoriesCell_Category$key;
}) {
  const record = useFragment(
    graphql`
      fragment TransactionCategoriesCell_Category on TransactionsOnCategories {
        category @required(action: THROW) {
          ...TransactionCategoryChip
        }
        ...useTransactionCellDeleteCategoryButton
      }
    `,
    record$key,
  );

  const { isDisabledDelete, onDelete } =
    useTransactionCellDeleteCategoryButton(record);

  return (
    <TransactionCategoryChip
      amount={amount}
      category={record.category}
      currency={currency}
      isDisabledDelete={isDisabledDelete}
      onDelete={onDelete}
    />
  );
}
