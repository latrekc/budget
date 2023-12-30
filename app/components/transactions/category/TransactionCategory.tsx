import { graphql, useFragment } from "react-relay";
import TransactionSubCategory from "./TransactionSubCategory";
import { TransactionCategory_category$key } from "./__generated__/TransactionCategory_category.graphql";
import TransactionButtons from "./buttons/TransactionCategoryButtons";

export default function TransactionCategory({
  category: category$key,
}: {
  category: TransactionCategory_category$key;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategory_category on Category {
        id
        name
        subCategories {
          id
          ...TransactionSubCategory_subcategory
        }
        ...TransactionCategoryButtons_category
      }
    `,
    category$key,
  );

  return (
    <div className="p-4">
      <div className="group flex flex-row items-center gap-4">
        <div>{category.name}</div>
        <TransactionButtons category={category} />
      </div>
      <div className="divide-y-small">
        {category.subCategories.map((subCategory) => (
          <TransactionSubCategory
            key={subCategory.id}
            subCategory={subCategory}
          />
        ))}
      </div>
    </div>
  );
}
