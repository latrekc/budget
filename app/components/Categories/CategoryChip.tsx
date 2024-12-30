import { graphql, useFragment } from "react-relay";

import { Currency } from "../Transactions/cell/__generated__/TransactionAmountCell.graphql";
import CategoryChip2 from "./CategoryChip2";
import { CategoryChip$key } from "./__generated__/CategoryChip.graphql";

export default function CategoryChip({
  category: category$key,
  currency,
  ignore = false,
  isDisabledDelete = false,
  onDelete,
  onlyLeaf = false,
  quantity,
}: {
  category: CategoryChip$key;
  currency?: Currency;
  ignore?: boolean;
  isDisabledDelete?: boolean;
  onDelete?: () => void;
  onlyLeaf?: boolean;
  quantity?: null | number;
}) {
  const category = useFragment(
    graphql`
      fragment CategoryChip on Category {
        # eslint-disable-next-line relay/unused-fields
        name @required(action: THROW)
        # eslint-disable-next-line relay/unused-fields
        color @required(action: THROW)

        parentCategory {
          # eslint-disable-next-line relay/unused-fields
          name @required(action: THROW)
          # eslint-disable-next-line relay/unused-fields
          color @required(action: THROW)

          parentCategory {
            # eslint-disable-next-line relay/unused-fields
            name @required(action: THROW)
            # eslint-disable-next-line relay/unused-fields
            color @required(action: THROW)
          }
        }
      }
    `,
    category$key,
  );

  return (
    <CategoryChip2
      categories={[
        category,
        category.parentCategory,
        category.parentCategory?.parentCategory,
      ]}
      currency={currency}
      ignore={ignore}
      isDisabledDelete={isDisabledDelete}
      onDelete={onDelete}
      onlyLeaf={onlyLeaf}
      quantity={quantity}
    />
  );
}
