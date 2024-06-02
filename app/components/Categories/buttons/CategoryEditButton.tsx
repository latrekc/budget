import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { LuTextCursorInput } from "react-icons/lu";
import { graphql, useFragment, useMutation } from "react-relay";

import { CategoryEditButton$key } from "./__generated__/CategoryEditButton.graphql";
import { CategoryEditButtonMutation } from "./__generated__/CategoryEditButtonMutation.graphql";

export default function CategoryEditButton({
  category: category$key,
}: {
  category: CategoryEditButton$key;
}) {
  const { publish } = usePubSub();

  const category = useFragment(
    graphql`
      fragment CategoryEditButton on Category {
        id @required(action: THROW)
        name @required(action: THROW)
        parentCategory {
          id @required(action: THROW)
        }
      }
    `,
    category$key,
  );

  const [commitEditMutation, isEditMutationInFlight] =
    useMutation<CategoryEditButtonMutation>(graphql`
      mutation CategoryEditButtonMutation(
        $id: ID!
        $name: String!
        $parent: ID
      ) {
        updateCategory(id: $id, name: $name, parent: $parent) {
          ... on Error {
            error: message
          }
        }
      }
    `);

  const [value, setValue] = useState(category.name);
  const [error, setError] = useState<Error | null>(null);

  const variant = useMemo(() => {
    return value.length > 0 && value.trim() != category.name
      ? "bordered"
      : "flat";
  }, [category.name, value]);

  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      setValue(category.name);
      setError(null);
    },
    [category.name],
  );

  const onEdit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (value.trim().length > 0 && value.trim() != category.name) {
        commitEditMutation({
          onCompleted(result) {
            if (result?.updateCategory?.error) {
              setError(new Error(result.updateCategory.error));
            } else {
              setValue(value);
              setError(null);
              setIsOpen(false);
              publish(PubSubChannels.Categories);
            }
          },
          onError(serverError) {
            setError(serverError);
          },
          variables: {
            id: category.id,
            name: value,
            parent: category?.parentCategory?.id,
          },
        });
      }
    },
    [
      category.id,
      category.name,
      category?.parentCategory?.id,
      commitEditMutation,
      publish,
      value,
    ],
  );

  return (
    <Popover
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showArrow
    >
      <PopoverTrigger>
        <Button isIconOnly size="sm" title="Edit category" variant="flat">
          <LuTextCursorInput size="2em" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <form onSubmit={onEdit}>
              <Input
                autoFocus
                className="p-4"
                errorMessage={error?.message}
                isDisabled={isEditMutationInFlight}
                isInvalid={error != null}
                label={
                  category.parentCategory != null
                    ? "Edit subcategory"
                    : "Edit category"
                }
                labelPlacement="inside"
                onValueChange={setValue}
                size="sm"
                value={value}
                variant={variant}
              />
            </form>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
