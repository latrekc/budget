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
import { TransactionCategoryEditButton$key } from "./__generated__/TransactionCategoryEditButton.graphql";
import { TransactionCategoryEditButtonMutation } from "./__generated__/TransactionCategoryEditButtonMutation.graphql";

export default function TransactionCategoryEditButton({
  category: category$key,
}: {
  category: TransactionCategoryEditButton$key;
}) {
  const { publish } = usePubSub();

  const category = useFragment(
    graphql`
      fragment TransactionCategoryEditButton on Category {
        id
        name
        parentCategory {
          id
        }
      }
    `,
    category$key,
  );

  const [commitEditMutation, isEditMutationInFlight] =
    useMutation<TransactionCategoryEditButtonMutation>(graphql`
      mutation TransactionCategoryEditButtonMutation(
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
  }, [value]);

  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      setValue(category.name);
      setError(null);
    },
    [value],
  );

  const onEdit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (value.trim().length > 0 && value.trim() != category.name) {
        commitEditMutation({
          variables: {
            id: category.id,
            name: value,
            parent: category?.parentCategory?.id,
          },
          onError(serverError) {
            setError(serverError);
          },
          onCompleted(result) {
            if (result.updateCategory.error) {
              setError(new Error(result.updateCategory.error));
            } else {
              setValue(value);
              setError(null);
              setIsOpen(false);
              publish(PubSubChannels.Categories);
            }
          },
        });
      }
    },
    [value],
  );

  return (
    <Popover
      showArrow
      onOpenChange={onOpenChange}
      isOpen={isOpen}
      backdrop="opaque"
    >
      <PopoverTrigger>
        <Button size="sm" variant="flat" title="Edit category" isIconOnly>
          <LuTextCursorInput size="2em" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <form onSubmit={onEdit}>
              <Input
                label={
                  category.parentCategory != null
                    ? "Edit subcategory"
                    : "Edit category"
                }
                autoFocus
                labelPlacement="inside"
                className="p-4"
                isDisabled={isEditMutationInFlight}
                isInvalid={error != null}
                errorMessage={error?.message}
                size="sm"
                value={value}
                variant={variant}
                onValueChange={setValue}
              />
            </form>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
