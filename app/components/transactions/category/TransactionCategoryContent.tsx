import { Checkbox } from "@nextui-org/react";
import { useCallback, useContext, useMemo } from "react";
import { graphql, useFragment } from "react-relay";

import { CategoriesContext } from "../TransactionsCategories";
import { TransactionCategoryContent$key } from "./__generated__/TransactionCategoryContent.graphql";
import TransactionCategoryButtons from "./buttons/TransactionCategoryButtons";
import TransactionCategoryChip from "./TransactionCategoryChip";

export default function TransactionCategoryContent({
  category: category$key,
  withAddButton = true,
}: {
  category: TransactionCategoryContent$key;
  withAddButton?: boolean;
}) {
  const { editMode, filterName } = useContext(CategoriesContext);

  const category = useFragment(
    graphql`
      fragment TransactionCategoryContent on Category {
        id @required(action: THROW)
        name @required(action: THROW)
        parentCategory {
          name @required(action: THROW)
          parentCategory {
            name @required(action: THROW)
          }
        }
        ...TransactionCategoryButtons
        ...TransactionCategoryChip
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

  return editMode ? (
    <div
      className={`group flex flex-row items-center justify-between gap-x-4 p-4 ${
        isMatchFilter ? "hover:bg-gray-100" : "opacity-50"
      }`}
    >
      <TransactionCategoryChip category={category} onlyLeaf />

      {isMatchFilter && (
        <TransactionCategoryButtons
          category={category}
          withAddButton={withAddButton}
        />
      )}
    </div>
  ) : (
    <Checkbox
      className="m-0 mt-1 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
      isDisabled={!isMatchFilter}
      key={category.id}
      value={category.id}
    >
      <TransactionCategoryChip category={category} onlyLeaf />
    </Checkbox>
  );
}
