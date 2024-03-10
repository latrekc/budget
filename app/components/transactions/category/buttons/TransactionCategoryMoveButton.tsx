import { usePubSub } from "@/lib/usePubSub";
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import { MdMoveDown } from "react-icons/md";
import { graphql, useFragment, useMutation } from "react-relay";

import { PubSubChannels } from "@/lib/types";
import TransactionCategoryAutocomplete from "../TransactionCategoryAutocomplete";
import { TransactionCategoryAutocompleteQuery$data } from "../__generated__/TransactionCategoryAutocompleteQuery.graphql";
import { TransactionCategoryMoveButton$key } from "./__generated__/TransactionCategoryMoveButton.graphql";
import { TransactionCategoryMoveButtonMutation } from "./__generated__/TransactionCategoryMoveButtonMutation.graphql";

export default function TransactionCategoryMoveButton({
  category: category$key,
}: {
  category: TransactionCategoryMoveButton$key;
}) {
  const { publish } = usePubSub();

  const { id, name, parentCategory, subCategories } = useFragment(
    graphql`
      fragment TransactionCategoryMoveButton on Category {
        id @required(action: THROW)
        name @required(action: THROW)
        parentCategory {
          id @required(action: THROW)
          parentCategory {
            __typename
          }
        }
        subCategories {
          id @required(action: THROW)
          subCategories {
            id @required(action: THROW)
          }
        }
      }
    `,
    category$key,
  );

  const ignoreIds = useMemo(() => {
    const list = [id];

    if (parentCategory != null) {
      list.push(parentCategory.id);
    }

    if (subCategories != null) {
      subCategories.forEach((subCategory) => {
        list.push(subCategory.id);

        if (subCategory.subCategories != null) {
          subCategory.subCategories.forEach((subSubCategory) => {
            list.push(subSubCategory.id);
          });
        }
      });
    }

    return list;
  }, [id, parentCategory, subCategories]);

  const filterCallback = useCallback(
    (categories: TransactionCategoryAutocompleteQuery$data["categories"]) =>
      categories?.filter(
        (category) =>
          !ignoreIds.includes(category.id) &&
          category.parentCategory?.parentCategory == null,
      ),
    [ignoreIds],
  );

  const [commitMoveMutation, isMoveMutationInFlight] =
    useMutation<TransactionCategoryMoveButtonMutation>(graphql`
      mutation TransactionCategoryMoveButtonMutation(
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

  const [error, setError] = useState<null | string>(null);

  const [isOpen, setIsOpen] = useState(false);

  const onOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    setError(null);
  }, []);

  const onMoveToRoot = useCallback(() => {
    commitMoveMutation({
      onCompleted(result) {
        if (result?.updateCategory?.error) {
          setError(result.updateCategory.error);
        } else {
          publish(PubSubChannels.Categories);
          onOpenChange(false);
        }
      },
      variables: {
        id: id,
        name: name,
        parent: null,
      },
    });
  }, [commitMoveMutation, id, name, onOpenChange, publish]);

  const onSelect = useCallback(
    (key: React.Key) => {
      commitMoveMutation({
        onCompleted(result) {
          if (result?.updateCategory?.error) {
            setError(result.updateCategory.error);
          } else {
            publish(PubSubChannels.Categories);
            onOpenChange(false);
          }
        },
        variables: {
          id: id,
          name: name,
          parent: key.toString(),
        },
      });
    },
    [commitMoveMutation, id, name, onOpenChange, publish],
  );

  return (
    <Popover
      backdrop="opaque"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showArrow
    >
      <PopoverTrigger>
        <Button isIconOnly size="sm" title="Move category" variant="flat">
          <MdMoveDown size="2em" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            {parentCategory !== null ? (
              <ButtonGroup>
                <Button
                  color="danger"
                  isDisabled={isMoveMutationInFlight}
                  onClick={onMoveToRoot}
                >
                  Move to the root
                </Button>
              </ButtonGroup>
            ) : null}

            <Spacer />

            <TransactionCategoryAutocomplete
              error={error}
              filterCallback={filterCallback}
              isDisabled={isMoveMutationInFlight}
              label={
                parentCategory != null
                  ? "Move subcategory to"
                  : "Move category to"
              }
              onSelect={onSelect}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
