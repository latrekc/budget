import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { FiltersState } from "../TransactionsFiltersReducer";
import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { TransactionSetCategoryButtonAllMutation } from "./__generated__/TransactionSetCategoryButtonAllMutation.graphql";
import { TransactionSetCategoryButtonMutation } from "./__generated__/TransactionSetCategoryButtonMutation.graphql";
import { TransactionSetCategoryButtonQuery } from "./__generated__/TransactionSetCategoryButtonQuery.graphql";

export default function TransactionSetCategoryButton({
  filters,
  onCompleted,
  transactions,
}: {
  filters?: FiltersState;
  onCompleted: () => void;
  transactions: "all" | { transaction: string; amount: number }[];
}) {
  const { publish } = usePubSub();
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

  const [commitAllMutation, isMutationAllInFlight] =
    useMutation<TransactionSetCategoryButtonAllMutation>(graphql`
      mutation TransactionSetCategoryButtonAllMutation(
        $category: String!
        $filters: filterTransactionsInput!
      ) {
        updateCategoriesForAllTransactions(
          category: $category
          filters: $filters
        ) {
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
      { fetchPolicy: "store-and-network" },
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
      if (transactions === "all") {
        if (filters == null) {
          throw new Error("Filters state is unknown");
        }

        commitAllMutation({
          variables: {
            category: key.toString(),
            filters,
          },
          onCompleted(result) {
            setSelectedKey(null);
            if (result.updateCategoriesForAllTransactions.message) {
              setError(result.updateCategoriesForAllTransactions.message);
            } else {
              publish(PubSubChannels.Transactions);
              onCompleted();
            }
          },
        });
      } else {
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
              publish(PubSubChannels.Transactions);
              onCompleted();
            }
          },
        });
      }
    },
    [transactions],
  );

  return (
    <Autocomplete
      autoFocus
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
      isDisabled={
        isMutationInFlight || isMutationAllInFlight || transactions.length == 0
      }
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
