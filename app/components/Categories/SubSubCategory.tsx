import { graphql, useFragment } from "react-relay";

import { SubSubCategory$key } from "./__generated__/SubSubCategory.graphql";
import { SubSubCategory_Categories$key } from "./__generated__/SubSubCategory_Categories.graphql";
import CategoryContent from "./CategoryContent";

export default function SubSubCategory({
  categories: categories$key,
  subCategory: subCategory$key,
}: {
  categories: SubSubCategory_Categories$key;
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

  const categories = useFragment(
    graphql`
      fragment SubSubCategory_Categories on Query {
        ...CategoryContent_Categories
      }
    `,
    categories$key,
  );

  return (
    <div className="p-x-4">
      <CategoryContent
        categories={categories}
        category={subCategory}
        withAddButton={false}
      />
    </div>
  );
}
