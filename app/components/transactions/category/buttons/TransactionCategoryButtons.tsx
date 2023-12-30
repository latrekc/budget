import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";
import TransactionCategoryAddButton from "./TransactionCategoryAddButton";
import TransactionCategoryDeleteButton from "./TransactionCategoryDeleteButton";
import TransactionCategoryEditButton from "./TransactionCategoryEditButton";
import { TransactionCategoryButtons_category$key } from "./__generated__/TransactionCategoryButtons_category.graphql";

export default function TransactionCategoryButtons({
  category: category$key,
  withAddButton = true,
}: {
  category: TransactionCategoryButtons_category$key;
  withAddButton?: boolean;
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
    <ButtonGroup>
      {withAddButton ? (
        <TransactionCategoryAddButton parent={category.id} />
      ) : null}
      <TransactionCategoryEditButton category={category} />
      <TransactionCategoryDeleteButton category={category} />
    </ButtonGroup>
  );
}
