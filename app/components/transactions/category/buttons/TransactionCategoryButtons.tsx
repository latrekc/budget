import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";

import { TransactionCategoryButtons$key } from "./__generated__/TransactionCategoryButtons.graphql";
import TransactionCategoryAddButton from "./TransactionCategoryAddButton";
import TransactionCategoryDeleteButton from "./TransactionCategoryDeleteButton";
import TransactionCategoryEditButton from "./TransactionCategoryEditButton";
import TransactionCategoryMoveButton from "./TransactionCategoryMoveButton";

export default function TransactionCategoryButtons({
  category: category$key,
  withAddButton = true,
}: {
  category: TransactionCategoryButtons$key;
  withAddButton?: boolean;
}) {
  const category = useFragment(
    graphql`
      fragment TransactionCategoryButtons on Category {
        id @required(action: THROW)
        ...TransactionCategoryDeleteButton
        ...TransactionCategoryEditButton
        ...TransactionCategoryMoveButton
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
      <TransactionCategoryMoveButton category={category} />
      <TransactionCategoryDeleteButton category={category} />
    </ButtonGroup>
  );
}
