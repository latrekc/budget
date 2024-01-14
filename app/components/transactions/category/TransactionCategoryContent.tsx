import { Checkbox } from "@nextui-org/react";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";

import { CategoriesModeContext } from "../TransactionsCategories";
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
  const editMode = useContext(CategoriesModeContext);
  const category = useFragment(
    graphql`
      fragment TransactionCategoryContent on Category {
        id @required(action: THROW)
        ...TransactionCategoryButtons
        ...TransactionCategoryChip
      }
    `,
    category$key,
  );
  return editMode ? (
    <div className="group flex flex-row items-center justify-between gap-x-4 p-4 hover:bg-gray-100">
      <TransactionCategoryChip category={category} onlyLeaf />
      <TransactionCategoryButtons
        category={category}
        withAddButton={withAddButton}
      />
    </div>
  ) : (
    <Checkbox
      className="m-0 min-w-[100%] flex-none cursor-pointer gap-4 rounded-lg border-2 border-white p-4 hover:bg-content2 data-[selected=true]:border-primary"
      key={category.id}
      value={category.id}
    >
      <TransactionCategoryChip category={category} onlyLeaf />
    </Checkbox>
  );
}
