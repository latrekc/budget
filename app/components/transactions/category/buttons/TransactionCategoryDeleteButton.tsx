import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from "@nextui-org/react";
import { useCallback, useContext } from "react";
import { TiDelete } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionsCategoriesContext } from "../../TransactionsContext";
import { TransactionCategoryDeleteButtonMutation } from "../__generated__/TransactionCategoryDeleteButtonMutation.graphql";
import { TransactionCategoryDeleteButton$key } from "./__generated__/TransactionCategoryDeleteButton.graphql";

export default function TransactionCategoryDeleteButton({
  category: category$key,
}: {
  category: TransactionCategoryDeleteButton$key;
}) {
  const { refetchCategories } = useContext(TransactionsCategoriesContext);

  const category = useFragment(
    graphql`
      fragment TransactionCategoryDeleteButton on Category {
        id
        name
        parentCategory {
          name
        }
      }
    `,
    category$key,
  );

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<TransactionCategoryDeleteButtonMutation>(graphql`
      mutation TransactionCategoryDeleteButtonMutation($id: ID!) {
        deleteCategory(id: $id) {
          ... on Error {
            error: message
          }
        }
      }
    `);

  const onDelete = useCallback(() => {
    if (category == null) {
      alert("Null category");
      return;
    }
    commitDeleteMutation({
      variables: {
        id: category.id,
      },
      onCompleted(result) {
        if (result.deleteCategory.error) {
          alert(result.deleteCategory.error);
        } else {
          refetchCategories();
        }
      },
    });
  }, []);

  return (
    <Popover showArrow backdrop="opaque">
      <PopoverTrigger>
        <Button
          color="danger"
          size="sm"
          variant="solid"
          title="Remove category"
          startContent={<TiDelete color="white" size="2em" />}
        >
          Remove
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <p className="text-small text-foreground">
              Are sure you want to remove <b>{category.name}</b> from{" "}
              {category.parentCategory == null ? (
                "a root category"
              ) : (
                <b>{category.parentCategory.name}</b>
              )}
              ?
            </p>

            <Spacer />

            <ButtonGroup>
              <Button
                isDisabled={isDeleteMutationInFlight}
                onClick={onDelete}
                color="danger"
              >
                Yes, remove
              </Button>
            </ButtonGroup>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
