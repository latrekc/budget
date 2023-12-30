import { Input } from "@nextui-org/react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { TransactionAddButtonMutation } from "./__generated__/TransactionAddButtonMutation.graphql";

export default function TransactionAddButton({
  parent,
  onUpdate,
}: {
  parent?: string;
  onUpdate: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const onClear = useCallback(() => {
    setValue("");
    setError(null);
  }, []);

  const variant = useMemo(() => {
    return value.length > 0 ? "bordered" : "flat";
  }, [value]);

  const [commitMutation, isMutationInFlight] =
    useMutation<TransactionAddButtonMutation>(graphql`
      mutation TransactionAddButtonMutation($name: String!, $parent: ID) {
        createCategory(name: $name, parent: $parent) {
          ... on MutationCreateCategorySuccess {
            data {
              ...TransactionCategory_category
            }
          }
          ... on Error {
            error: message
          }
        }
      }
    `);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (value.trim().length > 0) {
        commitMutation({
          variables: {
            name: value.trim(),
            parent,
          },
          onError(serverError) {
            setError(serverError);
          },
          onCompleted(result) {
            if (result.createCategory.error) {
              setError(new Error(result.createCategory.error));
            } else {
              setValue("");
              setError(null);
              onUpdate();
            }
          },
        });
      }
    },
    [value],
  );

  return (
    <form onSubmit={onSubmit}>
      <Input
        label={parent != null ? "Add subcategory" : "Add category"}
        labelPlacement="inside"
        className="p-4"
        isClearable
        onClear={onClear}
        isDisabled={isMutationInFlight}
        isInvalid={error != null}
        errorMessage={error?.message}
        size="sm"
        value={value}
        variant={variant}
        onValueChange={setValue}
      />
    </form>
  );
}
