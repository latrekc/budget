import { graphql, useFragment } from "react-relay";
import TransactionButtons from "./TransactionButtons";
import { TransactionSubCategory_subcategory$key } from "./__generated__/TransactionSubCategory_subcategory.graphql";

export default function TransactionSubCategory({
  subCategory: subCategory$key,
  onUpdate,
}: {
  subCategory: TransactionSubCategory_subcategory$key;
  onUpdate: () => void;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubCategory_subcategory on Category {
        name
        ...TransactionButtons_category
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-4">
      <div className="group flex flex-row items-center gap-4">
        <div>{subCategory.name}</div>
        <TransactionButtons category={subCategory} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
