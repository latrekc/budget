import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../Filters/FiltersCategories";
import CategoryContent from "./CategoryContent";
import SubSubCategory from "./SubSubCategory";
import {
  SubCategory$data,
  SubCategory$key,
} from "./__generated__/SubCategory.graphql";
import { SubCategory_Categories$key } from "./__generated__/SubCategory_Categories.graphql";

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
  categories: categories$key,
  subCategory: subCategory$key,
}: {
  categories: SubCategory_Categories$key;
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

  const categories = useFragment(
    graphql`
      fragment SubCategory_Categories on Query {
        ...CategoryContent_Categories
        ...SubSubCategory_Categories
      }
    `,
    categories$key,
  );

  const { filterName } = useContext(CategoriesContext);

  const subCategories = useMemo(
    () => filterByName(subCategory?.subCategories, filterName) ?? [],
    [filterName, subCategory?.subCategories],
  );

  return (
    <div>
      <CategoryContent categories={categories} category={subCategory} />

      {subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategories.map((subSubCategory) => (
            <SubSubCategory
              categories={categories}
              key={subSubCategory.id}
              subCategory={subSubCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
