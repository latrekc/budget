import { Input } from "@nextui-org/react";
import { FormEvent, useCallback, useContext, useMemo, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { TransactionsCategoriesContext } from "../../TransactionsContext";
import { TransactionCategoryAddButtonMutation } from "./__generated__/TransactionCategoryAddButtonMutation.graphql";

export default function TransactionCategoryAddButton({
  parent,
}: {
  parent?: string;
}) {
  const { refetchCategories } = useContext(TransactionsCategoriesContext);
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
    useMutation<TransactionCategoryAddButtonMutation>(graphql`
      mutation TransactionCategoryAddButtonMutation(
        $name: String!
        $parent: ID
      ) {
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
              refetchCategories();
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
