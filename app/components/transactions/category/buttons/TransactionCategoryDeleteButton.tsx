import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from "@nextui-org/react";
import { useCallback } from "react";
import { TiDelete } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionCategoryDeleteButtonMutation } from "../__generated__/TransactionCategoryDeleteButtonMutation.graphql";
import { TransactionCategoryDeleteButton$key } from "./__generated__/TransactionCategoryDeleteButton.graphql";

export default function TransactionCategoryDeleteButton({
  category: category$key,
}: {
  category: TransactionCategoryDeleteButton$key;
}) {
  const { publish } = usePubSub();

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
          publish(PubSubChannels.Categories);
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
          isIconOnly
        >
          <TiDelete color="white" size="2em" />
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
