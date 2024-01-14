import { graphql, useFragment } from "react-relay";

import { TransactionCategory$key } from "./__generated__/TransactionCategory.graphql";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubCategory from "./TransactionSubCategory";

export default function TransactionCategory({
  category: category$key,
}: {
  category: TransactionCategory$key;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategory on Category {
        ...TransactionCategoryContent
        subCategories {
          id @required(action: THROW)
          ...TransactionSubCategory
        }
      }
    `,
    category$key,
  );

  return (
    <div>
      <TransactionCategoryContent category={category} />

      {(category?.subCategories ?? []).length > 0 ? (
        <div className="pl-4">
          {category?.subCategories?.map((subCategory) => (
            <TransactionSubCategory
              key={subCategory.id}
              subCategory={subCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
