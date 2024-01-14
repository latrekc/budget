import { graphql, useFragment } from "react-relay";

import { useContext, useMemo } from "react";
import { CategoriesContext } from "../TransactionsCategories";
import TransactionCategoryContent from "./TransactionCategoryContent";
import TransactionSubCategory from "./TransactionSubCategory";
import {
  TransactionCategory$data,
  TransactionCategory$key,
} from "./__generated__/TransactionCategory.graphql";

type Categories = TransactionCategory$data["subCategories"];

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

export default function TransactionCategory({
  category: category$key,
}: {
  category: TransactionCategory$key;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategory on Category {
        ...TransactionCategoryContent
        subCategories {
          id @required(action: THROW)
          name @required(action: THROW)
          subCategories {
            name @required(action: THROW)
          }
          ...TransactionSubCategory
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
      <TransactionCategoryContent category={category} />

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
