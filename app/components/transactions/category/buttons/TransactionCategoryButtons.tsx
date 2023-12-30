import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
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
        ...TransactionCategoryDeleteButton_category
        ...TransactionCategoryEditButton_category
      }
    `,
    category$key,
  );

  return (
    <ButtonGroup className="invisible group-hover:visible">
      <TransactionCategoryDeleteButton category={category} />
      <TransactionCategoryEditButton category={category} />
    </ButtonGroup>
  );
}
