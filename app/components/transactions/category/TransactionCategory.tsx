import { graphql, useFragment } from "react-relay";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubCategory from "./TransactionSubCategory";
import { TransactionCategory_category$key } from "./__generated__/TransactionCategory_category.graphql";

export default function TransactionCategory({
  category: category$key,
}: {
  category: TransactionCategory_category$key;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategory_category on Category {
        ...TransactionCategoryContent_category
        subCategories {
          id
          ...TransactionSubCategory_subcategory
        }
      }
    `,
    category$key,
  );

  return (
    <div className="p-4">
      <TransactionCategoryContent category={category} />

      {category.subCategories.length > 0 ? (
        <div className="divide-y-small">
          {category.subCategories.map((subCategory) => (
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
