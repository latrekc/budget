import { Checkbox } from "@nextui-org/react";
import { useCallback, useContext, useMemo } from "react";
import { graphql, useFragment } from "react-relay";

import AmountValue from "@/components/AmountValue";
import { Currency } from "@/lib/types";
import { CategoriesContext, CategoryMode } from "../Filters/FiltersCategories";
import CategoryChip from "./CategoryChip";
import { CategoryContent$key } from "./__generated__/CategoryContent.graphql";
import CategoryButtons from "./buttons/CategoryButtons";

export default function CategoryContent({
  category: category$key,
  withAddButton = true,
}: {
  category: CategoryContent$key;
  withAddButton?: boolean;
}) {
  const { categoryMode, filterName, filters } = useContext(CategoriesContext);

  const category = useFragment(
    graphql`
      fragment CategoryContent on Category {
        id @required(action: THROW)
        name @required(action: THROW)
        income
        outcome
        parentCategory {
          name @required(action: THROW)
          parentCategory {
            name @required(action: THROW)
          }
        }
        ...CategoryButtons
        ...CategoryChip
      }
    `,
    category$key,
  );

  const test = useCallback(
    (name: null | string | undefined) =>
      name?.toLowerCase().includes(filterName.toLowerCase()),
    [filterName],
  );

  const isMatchFilter = useMemo(
    () =>
      filterName.length == 0 ||
      test(category?.name) ||
      test(category.parentCategory?.name) ||
      test(category.parentCategory?.parentCategory?.name),
    [
      category?.name,
      category.parentCategory?.name,
      category.parentCategory?.parentCategory?.name,
      filterName.length,
      test,
    ],
  );

  const isWrongMode = useMemo(
    () =>
      (categoryMode === CategoryMode.SELECT &&
        filters.ignoreCategories?.includes(category.id)) ||
      (categoryMode === CategoryMode.IGNORE &&
        filters.categories?.includes(category.id)),
    [category.id, categoryMode, filters.categories, filters.ignoreCategories],
  );

  return categoryMode === CategoryMode.EDIT ? (
    <div
      className={`group flex flex-row items-center justify-between gap-x-4 p-4 ${
        isMatchFilter ? "hover:bg-gray-100" : "opacity-50"
      }`}
    >
      <CategoryChip category={category} onlyLeaf />

      {isMatchFilter && (
        <CategoryButtons category={category} withAddButton={withAddButton} />
      )}
    </div>
  ) : (
    <Checkbox
      className={`m-0 mt-1 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 ${
        categoryMode === CategoryMode.SELECT
          ? "data-[selected=true]:border-primary"
          : "data-[selected=true]:border-danger"
      }`}
      isDisabled={!isMatchFilter || isWrongMode}
      key={category.id}
      value={category.id}
    >
      <div className="flex gap-2">
        <CategoryChip category={category} onlyLeaf />
        {category.income !== 0 && (
          <AmountValue amount={category.income} currency={Currency.GBP} round />
        )}
        {category.income !== 0 && category.outcome !== 0 && " / "}
        {category.outcome !== 0 && (
          <AmountValue
            amount={category.outcome}
            currency={Currency.GBP}
            round
          />
        )}
      </div>
    </Checkbox>
  );
}
