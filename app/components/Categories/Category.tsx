import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../Filters/FiltersCategories";
import CategoryContent from "./CategoryContent";
import TransactionSubCategory from "./SubCategory";
import { Category$data, Category$key } from "./__generated__/Category.graphql";

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
  category: category$key,
}: {
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

  const { filterName } = useContext(CategoriesContext);

  const subCategories = useMemo(
    () => filterByName(category?.subCategories, filterName) ?? [],
    [category?.subCategories, filterName],
  );

  return (
    <div>
      <CategoryContent category={category} />

      {subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategories.map((subCategory) => (
            <TransactionSubCategory
              key={subCategory.id}
              subCategory={subCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
