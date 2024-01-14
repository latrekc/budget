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
import { TiPlus } from "react-icons/ti";
import { graphql, useMutation } from "react-relay";

import { TransactionCategoryAddButtonMutation } from "./__generated__/TransactionCategoryAddButtonMutation.graphql";

export default function TransactionCategoryAddButton({
  parent,
  withLabel,
}: {
  parent?: string;
  withLabel?: boolean;
}) {
  const { publish } = usePubSub();

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
          onCompleted(result) {
            if (result?.createCategory?.error) {
              setError(new Error(result.createCategory.error));
            } else {
              setValue("");
              setError(null);
              setIsOpen(false);
              publish(PubSubChannels.Categories);
            }
          },
          onError(serverError) {
            setError(serverError);
          },
          variables: {
            name: value.trim(),
            parent,
          },
        });
      }
    },
    [commitMutation, parent, publish, value],
  );

  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    setValue("");
    setError(null);
  }, []);

  const label = parent != null ? "Add subcategory" : "Add category";

  return (
    <Popover
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showArrow
    >
      <PopoverTrigger>
        <Button
          isIconOnly={!withLabel}
          size="sm"
          startContent={withLabel ? <TiPlus size="2em" /> : null}
          title={label}
          variant="flat"
        >
          {withLabel ? label : <TiPlus size="2em" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <form onSubmit={onSubmit}>
              <Input
                autoFocus
                className="p-4"
                errorMessage={error?.message}
                isClearable
                isDisabled={isMutationInFlight}
                isInvalid={error != null}
                label={label}
                labelPlacement="inside"
                onClear={onClear}
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
