import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FormEvent, useCallback, useContext, useMemo, useState } from "react";
import { TiPlus } from "react-icons/ti";
import { graphql, useMutation } from "react-relay";
import { TransactionsCategoriesContext } from "../../TransactionsContext";
import { TransactionCategoryAddButtonMutation } from "./__generated__/TransactionCategoryAddButtonMutation.graphql";

export default function TransactionCategoryAddButton({
  parent,
  longLabel,
}: {
  parent?: string;
  longLabel?: boolean;
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
              ...TransactionCategory
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
              setIsOpen(false);
              refetchCategories();
            }
          },
        });
      }
    },
    [value],
  );

  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      setValue("");
      setError(null);
    },
    [value],
  );

  const label = parent != null ? "Add subcategory" : "Add category";

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
          variant="flat"
          title={label}
          startContent={<TiPlus size="2em" />}
        >
          {longLabel ? label : "Add"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <form onSubmit={onSubmit}>
              <Input
                label={label}
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
                autoFocus
              />
            </form>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
