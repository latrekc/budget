import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";

import { CategoryButtons$key } from "./__generated__/CategoryButtons.graphql";
import CategoryAddButton from "./CategoryAddButton";
import CategoryDeleteButton from "./CategoryDeleteButton";
import CategoryEditButton from "./CategoryEditButton";
import CategoryMoveButton from "./CategoryMoveButton";

export default function CategoryButtons({
  category: category$key,
  withAddButton = true,
}: {
  category: CategoryButtons$key;
  withAddButton?: boolean;
}) {
  const category = useFragment(
    graphql`
      fragment CategoryButtons on Category {
        id @required(action: THROW)
        ...CategoryDeleteButton
        ...CategoryEditButton
        ...CategoryMoveButton
      }
    `,
    category$key,
  );

  return (
    <ButtonGroup>
      {withAddButton ? <CategoryAddButton parent={category.id} /> : null}
      <CategoryEditButton category={category} />
      <CategoryMoveButton category={category} />
      <CategoryDeleteButton category={category} />
    </ButtonGroup>
  );
}
