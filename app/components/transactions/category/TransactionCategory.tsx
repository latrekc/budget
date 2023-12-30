import { graphql, useFragment } from "react-relay";
import TransactionAddButton from "./TransactionAddButton";
import TransactionButtons from "./TransactionButtons";
import TransactionSubCategory from "./TransactionSubCategory";
import { TransactionCategory_category$key } from "./__generated__/TransactionCategory_category.graphql";

export default function TransactionCategory({
  category: category$key,
  onUpdate,
}: {
  category: TransactionCategory_category$key;
  onUpdate: () => void;
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
        ...TransactionButtons_category
      }
    `,
    category$key,
  );

  return (
    <div className="p-4">
      <div className="group flex flex-row items-center gap-4">
        <div>{category.name}</div>
        <TransactionButtons category={category} onUpdate={onUpdate} />
      </div>
      <div className="divide-y-small">
        {category.subCategories.map((subCategory) => (
          <TransactionSubCategory
            key={subCategory.id}
            subCategory={subCategory}
            onUpdate={onUpdate}
          />
        ))}
        <TransactionAddButton parent={category.id} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
