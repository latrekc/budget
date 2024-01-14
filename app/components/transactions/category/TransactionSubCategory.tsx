import { graphql, useFragment } from "react-relay";

import { TransactionSubCategory$key } from "./__generated__/TransactionSubCategory.graphql";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubSubCategory from "./TransactionSubSubCategory";

export default function TransactionSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubCategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubCategory on Category {
        ...TransactionCategoryContent
        subCategories {
          id @required(action: THROW)
          ...TransactionSubSubCategory
        }
      }
    `,
    subCategory$key,
  );
  return (
    <div>
      <TransactionCategoryContent category={subCategory} />

      {(subCategory?.subCategories ?? []).length > 0 ? (
        <div className="pl-4">
          {subCategory?.subCategories?.map((subSubCategory) => (
            <TransactionSubSubCategory
              key={subSubCategory.id}
              subCategory={subSubCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
