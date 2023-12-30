import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
import TransactionCategoryAddButton from "./TransactionCategoryAddButton";
import TransactionCategoryDeleteButton from "./TransactionCategoryDeleteButton";
import TransactionCategoryEditButton from "./TransactionCategoryEditButton";
import { TransactionCategoryButtons_category$key } from "./__generated__/TransactionCategoryButtons_category.graphql";

export default function TransactionCategoryButtons({
  category: category$key,
}: {
  category: TransactionCategoryButtons_category$key;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryButtons_category on Category {
        id
        ...TransactionCategoryDeleteButton_category
        ...TransactionCategoryEditButton_category
      }
    `,
    category$key,
  );

  return (
    <ButtonGroup className="invisible group-hover:visible">
      <TransactionCategoryAddButton parent={category.id} />
      <TransactionCategoryEditButton category={category} />
      <TransactionCategoryDeleteButton category={category} />
    </ButtonGroup>
  );
}
