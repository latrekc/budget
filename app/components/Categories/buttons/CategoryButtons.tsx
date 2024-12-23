import { ButtonGroup } from "@nextui-org/react";
import { graphql, useFragment } from "react-relay";

import { CategoryButtons$key } from "./__generated__/CategoryButtons.graphql";
import { CategoryButtons_Categories$key } from "./__generated__/CategoryButtons_Categories.graphql";
import CategoryAddButton from "./CategoryAddButton";
import CategoryDeleteButton from "./CategoryDeleteButton";
import CategoryEditButton from "./CategoryEditButton";
import CategoryMoveButton from "./CategoryMoveButton";

export default function CategoryButtons({
  categories: categories$key,
  category: category$key,
  withAddButton = true,
}: {
  categories: CategoryButtons_Categories$key;
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

  const categories = useFragment(
    graphql`
      fragment CategoryButtons_Categories on Query {
        ...CategoryMoveButton_Categories
      }
    `,
    categories$key,
  );

  return (
    <ButtonGroup>
      {withAddButton ? <CategoryAddButton parent={category.id} /> : null}
      <CategoryEditButton category={category} />
      <CategoryMoveButton categories={categories} category={category} />
      <CategoryDeleteButton category={category} />
    </ButtonGroup>
  );
}
