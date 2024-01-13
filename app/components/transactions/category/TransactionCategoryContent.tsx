import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import { CategoriesModeContext } from "../TransactionsCategories";
import TransactionCategoryChip from "./TransactionCategoryChip";
import { TransactionCategoryContent$key } from "./__generated__/TransactionCategoryContent.graphql";
import TransactionCategoryButtons from "./buttons/TransactionCategoryButtons";

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
        ...TransactionCategoryButtons
        ...TransactionCategoryChip
      }
    `,
    category$key,
  );
  return (
    <div className="group flex flex-row items-center justify-between gap-x-4 p-4 hover:bg-gray-100">
      <TransactionCategoryChip category={category} onlyLeaf />
      {editMode && (
        <TransactionCategoryButtons
          category={category}
          withAddButton={withAddButton}
        />
      )}
    </div>
  );
}
