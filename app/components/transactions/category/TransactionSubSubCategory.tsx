import { graphql, useFragment } from "react-relay";
import TransactionCategoryContent from "./TransactionCategoryContent";
import { TransactionSubSubCategory$key } from "./__generated__/TransactionSubSubCategory.graphql";

export default function TransactionSubSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubSubCategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubSubCategory on Category {
        ...TransactionCategoryContent
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-x-4">
      <TransactionCategoryContent
        category={subCategory}
        withAddButton={false}
      />
    </div>
  );
}
