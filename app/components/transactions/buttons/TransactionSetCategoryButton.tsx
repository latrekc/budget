import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { TransactionSetCategoryButtonMutation } from "./__generated__/TransactionSetCategoryButtonMutation.graphql";
import { TransactionSetCategoryButtonQuery } from "./__generated__/TransactionSetCategoryButtonQuery.graphql";

export default function TransactionSetCategoryButton({
  onCompleted,
  transactions,
}: {
  onCompleted: () => void;
  transactions: { transaction: string; amount: number }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [commitMutation, isMutationInFlight] =
    useMutation<TransactionSetCategoryButtonMutation>(graphql`
      mutation TransactionSetCategoryButtonMutation(
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
    useLazyLoadQuery<TransactionSetCategoryButtonQuery>(
      graphql`
        query TransactionSetCategoryButtonQuery {
          categories {
            id
            name
            parentCategory {
              name
              parentCategory {
                name
              }
            }
            ...TransactionCategoryChip
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

  const onSelect = useCallback(
    (key: React.Key) => {
      commitMutation({
        variables: {
          transactions: transactions.map((transaction) => ({
            ...transaction,
            category: key.toString(),
          })),
        },
        onCompleted(result) {
          setSelectedKey(null);
          if (result.updateCategoriesForTransactions.message) {
            setError(result.updateCategoriesForTransactions.message);
          } else {
            onCompleted();
          }
        },
      });
    },
    [transactions],
  );

  return (
    <Autocomplete
      label="Update category"
      items={categories}
      selectedKey={selectedKey}
      onInputChange={onInputChange}
      className="max-w-xs"
      popoverProps={{
        classNames: {
          content: "w-[450px]",
        },
      }}
      onSelectionChange={onSelect}
      isDisabled={isMutationInFlight || transactions.length == 0}
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
  );
}
