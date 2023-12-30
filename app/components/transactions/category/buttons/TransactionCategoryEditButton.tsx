import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FormEvent, useCallback, useContext, useMemo, useState } from "react";
import { TiEdit } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionsCategoriesContext } from "../../TransactionsContext";
import { TransactionCategoryEditButtonMutation } from "./__generated__/TransactionCategoryEditButtonMutation.graphql";
import { TransactionCategoryEditButton_category$key } from "./__generated__/TransactionCategoryEditButton_category.graphql";

export default function TransactionCategoryEditButton({
  category: category$key,
}: {
  category: TransactionCategoryEditButton_category$key;
}) {
  const { refetchCategories } = useContext(TransactionsCategoriesContext);

  const category = useFragment(
    graphql`
      fragment TransactionCategoryEditButton_category on Category {
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
              refetchCategories();
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
        <Button
          size="sm"
          variant="solid"
          radius="full"
          title="Edit category"
          isIconOnly
        >
          <TiEdit size="2em" />
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
