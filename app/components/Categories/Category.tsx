import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../Filters/FiltersCategories";
import CategoryContent from "./CategoryContent";
import SubCategory from "./SubCategory";
import { Category$data, Category$key } from "./__generated__/Category.graphql";
import { Category_Categories$key } from "./__generated__/Category_Categories.graphql";

type Categories = Category$data["subCategories"];

function filterByName(allCategories: Categories, searchTerm: string) {
  const test = (name: string | undefined) =>
    name?.toLowerCase().includes(searchTerm.toLowerCase());

  return searchTerm.length > 0
    ? allCategories?.filter(
        ({ name, parentCategory, subCategories }) =>
          test(name) ||
          test(parentCategory?.name) ||
          subCategories?.some((subCategory) => test(subCategory.name)),
      )
    : allCategories;
}

export default function Category({
  categories: categories$key,
  category: category$key,
}: {
  categories: Category_Categories$key;
  category: Category$key;
}) {
  const category = useFragment(
    graphql`
      fragment Category on Category {
        ...CategoryContent
        subCategories {
          id @required(action: THROW)
          name @required(action: THROW)
          subCategories {
            name @required(action: THROW)
          }
          ...SubCategory
          parentCategory {
            name @required(action: THROW)
          }
        }
      }
    `,
    category$key,
  );

  const categories = useFragment(
    graphql`
      fragment Category_Categories on Query {
        ...CategoryContent_Categories
        ...SubCategory_Categories
      }
    `,
    categories$key,
  );

  const { filterName } = useContext(CategoriesContext);

  const subCategories = useMemo(
    () => filterByName(category?.subCategories, filterName) ?? [],
    [category?.subCategories, filterName],
  );

  return (
    <div>
      <CategoryContent categories={categories} category={category} />

      {subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategories.map((subCategory) => (
            <SubCategory
              categories={categories}
              key={subCategory.id}
              subCategory={subCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
