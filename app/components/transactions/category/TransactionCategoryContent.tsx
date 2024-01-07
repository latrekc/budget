import { Snippet, Tooltip } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
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
  const category = useFragment(
    graphql`
      fragment TransactionCategoryContent on Category {
        id
        ...TransactionCategoryButtons
        ...TransactionCategoryChip
      }
    `,
    category$key,
  );
  return (
    <Tooltip
      content={
        <div className="p-4">
          <TransactionCategoryButtons
            category={category}
            withAddButton={withAddButton}
          />
        </div>
      }
      showArrow
      placement="bottom"
      offset={-15}
    >
      <div className="group flex flex-row items-center gap-x-4 p-4 hover:bg-gray-100">
        <TransactionCategoryChip category={category} onlyLeaf />
        <Snippet
          hideSymbol
          codeString={category.id}
          variant="flat"
          size="sm"
          classNames={{ content: "hidden", base: "p-0 gap-0" }}
        />
      </div>
    </Tooltip>
  );
}
