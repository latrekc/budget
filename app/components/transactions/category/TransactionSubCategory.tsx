import { graphql, useFragment } from "react-relay";
import { TransactionSubCategory_subcategory$key } from "./__generated__/TransactionSubCategory_subcategory.graphql";
import TransactionButtons from "./buttons/TransactionCategoryButtons";

export default function TransactionSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubCategory_subcategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubCategory_subcategory on Category {
        name
        ...TransactionCategoryButtons_category
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-4">
      <div className="group flex flex-row items-center gap-4">
        <div>{subCategory.name}</div>
        <TransactionButtons category={subCategory} />
      </div>
    </div>
  );
}
