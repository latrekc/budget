import { graphql, useFragment } from "react-relay";

import { SubSubCategory$key } from "./__generated__/SubSubCategory.graphql";
import CategoryContent from "./CategoryContent";

export default function SubSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: SubSubCategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment SubSubCategory on Category {
        ...CategoryContent
      }
    `,
    subCategory$key,
  );
  return (
    <div className="p-x-4">
      <CategoryContent category={subCategory} withAddButton={false} />
    </div>
  );
}
