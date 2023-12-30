import { graphql, useFragment } from "react-relay";
import { TransactionCategoryContent_category$key } from "./__generated__/TransactionCategoryContent_category.graphql";
import TransactionCategoryButtons from "./buttons/TransactionCategoryButtons";

export default function TransactionCategoryContent({
  category: category$key,
  withAddButton = true,
}: {
  category: TransactionCategoryContent_category$key;
  withAddButton?: boolean;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryContent_category on Category {
        name
        ...TransactionCategoryButtons_category
      }
    `,
    category$key,
  );
  return (
    <div className="group flex flex-row items-center gap-4">
      <div>{category.name}</div>
      <TransactionCategoryButtons
        category={category}
        withAddButton={withAddButton}
      />
    </div>
  );
}
