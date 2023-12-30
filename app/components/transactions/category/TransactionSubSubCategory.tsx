import { graphql, useFragment } from "react-relay";
import TransactionCategoryContent from "./TransactionCategoryContent";
import { TransactionSubSubCategory_subcategory$key } from "./__generated__/TransactionSubSubCategory_subcategory.graphql";

export default function TransactionSubSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubSubCategory_subcategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubSubCategory_subcategory on Category {
        ...TransactionCategoryContent_category
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-4">
      <TransactionCategoryContent
        category={subCategory}
        withAddButton={false}
      />
    </div>
  );
}
