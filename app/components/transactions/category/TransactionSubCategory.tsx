import { graphql, useFragment } from "react-relay";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubSubCategory from "./TransactionSubSubCategory";
import { TransactionSubCategory_subcategory$key } from "./__generated__/TransactionSubCategory_subcategory.graphql";

export default function TransactionSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubCategory_subcategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubCategory_subcategory on Category {
        ...TransactionCategoryContent_category
        subCategories {
          id
          ...TransactionSubSubCategory_subcategory
        }
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-4">
      <TransactionCategoryContent category={subCategory} />

      {subCategory.subCategories.length > 0 ? (
        <div className="divide-y-small">
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
