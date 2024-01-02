import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useState } from "react";
import { TiPlus } from "react-icons/ti";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import TransactionCategoryChip from "../../category/TransactionCategoryChip";
import { TransactionCellAddCategoryButton$key } from "./__generated__/TransactionCellAddCategoryButton.graphql";
import { TransactionCellAddCategoryButtonQuery } from "./__generated__/TransactionCellAddCategoryButtonQuery.graphql";
import { TransactionCellAddCategoryButtonnMutation } from "./__generated__/TransactionCellAddCategoryButtonnMutation.graphql";

export default function TransactionCellAddCategoryButton({
  transaction: transaction$key,
}: {
  transaction: TransactionCellAddCategoryButton$key;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { id, amount } = useFragment(
    graphql`
      fragment TransactionCellAddCategoryButton on Transaction {
        id
        amount
      }
    `,
    transaction$key,
  );

  const [commitMutation, isMutationInFlight] =
    useMutation<TransactionCellAddCategoryButtonnMutation>(graphql`
      mutation TransactionCellAddCategoryButtonnMutation(
        $transactions: [updateCategoriesForTransactionsInput!]!
      ) {
        updateCategoriesForTransactions(transactions: $transactions) {
          ... on MutationUpdateCategoriesForTransactionsSuccess {
            data {
              id
              completed
              categories {
                amount
                category {
                  id
                }
              }
            }
          }
          ... on Error {
            message
          }
        }
      }
    `);

  const { categories: allCategories } =
    useLazyLoadQuery<TransactionCellAddCategoryButtonQuery>(
      graphql`
        query TransactionCellAddCategoryButtonQuery {
          categories {
            id
            name
            parentCategory {
              name
              parentCategory {
                name
              }
            }
            ...TransactionCategoryChip_category
          }
        }
      `,
      {},
    );

  const [categories, setCategories] = useState(allCategories);

  const onInputChange = useCallback((searchTerm: string) => {
    setCategories(
      searchTerm.length > 0
        ? allCategories.filter(
            ({ name, parentCategory }) =>
              name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              parentCategory?.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              parentCategory?.parentCategory?.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          )
        : allCategories,
    );
  }, []);

  const onSelect = useCallback((key: React.Key) => {
    commitMutation({
      variables: {
        transactions: [
          {
            transaction: id,
            category: key.toString(),
            amount,
          },
        ],
      },
      onCompleted(result) {
        if (result.updateCategoriesForTransactions.message) {
          setError(result.updateCategoriesForTransactions.message);
        } else {
          setIsOpen(false);
        }
      },
    });
  }, []);

  return (
    <Popover
      showArrow
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger onClick={() => setIsOpen(true)}>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          title="Set category"
          className="p-0"
        >
          <TiPlus size="1em" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px]">
        {() => (
          <div className="w-full p-4">
            <Autocomplete
              label="Select category"
              items={categories}
              onInputChange={onInputChange}
              popoverProps={{
                classNames: {
                  content: "w-[450px]",
                },
              }}
              onSelectionChange={onSelect}
              isDisabled={isMutationInFlight}
              isInvalid={error != null}
              errorMessage={error}
            >
              {(category) => (
                <AutocompleteItem key={category.id} value={category.id}>
                  <div className="flex shrink flex-row flex-wrap">
                    <TransactionCategoryChip category={category} />
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
