import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../TransactionsCategories";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubSubCategory from "./TransactionSubSubCategory";
import {
  TransactionSubCategory$data,
  TransactionSubCategory$key,
} from "./__generated__/TransactionSubCategory.graphql";

type Categories = TransactionSubCategory$data["subCategories"];

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

export default function TransactionSubCategory({
  subCategory: subCategory$key,
}: {
  subCategory: TransactionSubCategory$key;
}) {
  const subCategory = useFragment(
    graphql`
      fragment TransactionSubCategory on Category {
        ...TransactionCategoryContent
        subCategories {
          id @required(action: THROW)
          name @required(action: THROW)
          parentCategory {
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
            }
          }
          ...TransactionSubSubCategory
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
      <TransactionCategoryContent category={subCategory} />

      {subCategories.length > 0 ? (
        <div className="pl-4">
          {subCategories.map((subSubCategory) => (
            <TransactionSubSubCategory
              key={subSubCategory.id}
              subCategory={subSubCategory}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
