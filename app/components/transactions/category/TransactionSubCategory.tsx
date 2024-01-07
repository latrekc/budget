import { graphql, useFragment } from "react-relay";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubSubCategory from "./TransactionSubSubCategory";
import { TransactionSubCategory$key } from "./__generated__/TransactionSubCategory.graphql";

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
          id
          ...TransactionSubSubCategory
        }
      }
    `,
    subCategory$key,
  );
  return (
    <div>
      <TransactionCategoryContent category={subCategory} />

      {subCategory.subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategory.subCategories.map((subSubCategory) => (
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
