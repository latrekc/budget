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
import { CategoryDeleteButton$key } from "./__generated__/CategoryDeleteButton.graphql";
import { CategoryDeleteButtonMutation } from "./__generated__/CategoryDeleteButtonMutation.graphql";

export default function CategoryDeleteButton({
  category: category$key,
}: {
  category: CategoryDeleteButton$key;
}) {
  const { publish } = usePubSub();

  const category = useFragment(
    graphql`
      fragment CategoryDeleteButton on Category {
        id @required(action: THROW)
        name @required(action: THROW)
        parentCategory {
          name @required(action: THROW)
        }
      }
    `,
    category$key,
  );

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<CategoryDeleteButtonMutation>(graphql`
      mutation CategoryDeleteButtonMutation($id: ID!) {
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
      onCompleted(result) {
        if (result?.deleteCategory?.error) {
          alert(result.deleteCategory.error);
        } else {
          publish(PubSubChannels.Categories);
        }
      },
      variables: {
        id: category.id,
      },
    });
  }, [category, commitDeleteMutation, publish]);

  return (
    <Popover backdrop="opaque" showArrow>
      <PopoverTrigger>
        <Button
          color="danger"
          isIconOnly
          size="sm"
          title="Remove category"
          variant="solid"
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
                color="danger"
                isDisabled={isDeleteMutationInFlight}
                onClick={onDelete}
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
