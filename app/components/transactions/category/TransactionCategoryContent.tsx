import { Tooltip } from "@nextui-org/react";
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
        color
        ...TransactionCategoryButtons_category
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
        <div
          className="box-border h-4 w-4 rounded-sm bg-default shadow-small"
          style={{ backgroundColor: category.color! }}
        ></div>
        <div>{category.name}</div>
      </div>
    </Tooltip>
  );
}
