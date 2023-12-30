import { Button, ButtonGroup, Input } from "@nextui-org/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { TiDelete, TiEdit } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionButtonsDeleteMutation } from "./__generated__/TransactionButtonsDeleteMutation.graphql";
import { TransactionButtonsEditMutation } from "./__generated__/TransactionButtonsEditMutation.graphql";
import { TransactionButtons_category$key } from "./__generated__/TransactionButtons_category.graphql";

export default function TransactionButtons({
  category: category$key,
  onUpdate,
}: {
  category: TransactionButtons_category$key;
  onUpdate: () => void;
}) {
  const [editMode, setEditMode] = useState(false);

  const category = useFragment(
    graphql`
      fragment TransactionButtons_category on Category {
        id
        name
        parentCategory {
          id
        }
      }
    `,
    category$key,
  );

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<TransactionButtonsDeleteMutation>(graphql`
      mutation TransactionButtonsDeleteMutation($id: ID!) {
        deleteCategory(id: $id) {
          ... on Error {
            error: message
          }
        }
      }
    `);

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
          onUpdate();
        }
      },
    });
  }, []);

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
              onUpdate();
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
      <Button
        color="danger"
        size="sm"
        variant="solid"
        radius="full"
        title="Remove category"
        isDisabled={isDeleteMutationInFlight}
        startContent={<TiDelete color="white" size="2em" />}
        onClick={onDelete}
      >
        Remove
      </Button>

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
