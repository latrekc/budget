import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../Filters/FiltersCategories";
import CategoryContent from "./CategoryContent";
import SubSubCategory from "./SubSubCategory";
import {
  SubCategory$data,
  SubCategory$key,
} from "./__generated__/SubCategory.graphql";

type Categories = SubCategory$data["subCategories"];

function filterByName(allCategories: Categories, searchTerm: string) {
  const test = (name: string | undefined) =>
    name?.toLowerCase().includes(searchTerm.toLowerCase());

  return searchTerm.length > 0
    ? allCategories?.filter(
        ({ name, parentCategory }) =>
          test(name) ||
          test(parentCategory?.name) ||
          test(parentCategory?.parentCategory?.name),
      )
    : allCategories;
}

export default function SubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: SubCategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment SubCategory on Category {
        ...CategoryContent
        subCategories {
          id @required(action: THROW)
          name @required(action: THROW)
          parentCategory {
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
            }
          }
          ...SubSubCategory
        }
      }
    `,
    subCategory$key,
  );

  const { filterName } = useContext(CategoriesContext);

  const subCategories = useMemo(
    () => filterByName(subCategory?.subCategories, filterName) ?? [],
    [filterName, subCategory?.subCategories],
  );

  return (
    <div>
      <CategoryContent category={subCategory} />

      {subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategories.map((subSubCategory) => (
            <SubSubCategory
              key={subSubCategory.id}
              subCategory={subSubCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
