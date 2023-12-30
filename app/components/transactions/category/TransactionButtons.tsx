import { Button, ButtonGroup, Input } from "@nextui-org/react";
import { FormEvent, useCallback, useContext, useMemo, useState } from "react";
import { TiEdit } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionsCategoriesContext } from "../TransactionsContext";
import TransactionCategoryDeleteButton from "./TransactionCategoryDeleteButton";
import { TransactionButtonsEditMutation } from "./__generated__/TransactionButtonsEditMutation.graphql";
import { TransactionButtons_category$key } from "./__generated__/TransactionButtons_category.graphql";

export default function TransactionButtons({
  category: category$key,
}: {
  category: TransactionButtons_category$key;
}) {
  const { refetchCategories } = useContext(TransactionsCategoriesContext);
  const [editMode, setEditMode] = useState(false);

  const category = useFragment(
    graphql`
      fragment TransactionButtons_category on Category {
        id
        name
        parentCategory {
          id
        }
        ...TransactionCategoryDeleteButton_category
      }
    `,
    category$key,
  );

  const [commitEditMutation, isEditMutationInFlight] =
    useMutation<TransactionButtonsEditMutation>(graphql`
      mutation TransactionButtonsEditMutation(
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

  const onStartEdit = useCallback(() => {
    setValue(value);
    setEditMode(true);
  }, [value]);

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
              setEditMode(false);
              refetchCategories();
            }
          },
        });
      }
    },
    [value],
  );

  const onClear = useCallback(() => {
    setEditMode(false);
  }, []);

  return editMode ? (
    <form onSubmit={onEdit}>
      <Input
        label={
          category.parentCategory != null ? "Edit subcategory" : "Edit category"
        }
        labelPlacement="inside"
        className="p-4"
        isClearable
        onClear={onClear}
        isDisabled={isEditMutationInFlight}
        isInvalid={error != null}
        errorMessage={error?.message}
        size="sm"
        value={value}
        variant={variant}
        onValueChange={setValue}
      />
    </form>
  ) : (
    <ButtonGroup className="invisible group-hover:visible">
      <TransactionCategoryDeleteButton category={category} />
      <Button
        size="sm"
        variant="solid"
        radius="full"
        title="Edit category"
        startContent={<TiEdit size="2em" />}
        onClick={onStartEdit}
      >
        Edit
      </Button>
    </ButtonGroup>
  );
}
