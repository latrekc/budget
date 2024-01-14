import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useCallback, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import TransactionCategoryChip from "../category/TransactionCategoryChip";
import { FiltersState } from "../TransactionsFiltersReducer";
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
  transactions: "all" | { amount: number; transaction: string }[];
}) {
  const { publish } = usePubSub();
  const [error, setError] = useState<null | string>(null);
  const [selectedKey, setSelectedKey] = useState<null | string>(null);

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
            id @required(action: THROW)
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
              parentCategory {
                name @required(action: THROW)
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

  const onInputChange = useCallback(
    (searchTerm: string) => {
      setCategories(
        searchTerm.length > 0
          ? allCategories?.filter(
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
    },
    [allCategories],
  );

  const onSelect = useCallback(
    (key: React.Key) => {
      if (transactions === "all") {
        if (filters == null) {
          throw new Error("Filters state is unknown");
        }

        commitAllMutation({
          onCompleted(result) {
            setSelectedKey(null);
            if (result?.updateCategoriesForAllTransactions?.message) {
              setError(result.updateCategoriesForAllTransactions.message);
            } else {
              publish(PubSubChannels.Transactions);
              onCompleted();
            }
          },
          variables: {
            category: key.toString(),
            filters,
          },
        });
      } else {
        commitMutation({
          onCompleted(result) {
            setSelectedKey(null);
            if (result?.updateCategoriesForTransactions?.message) {
              setError(result.updateCategoriesForTransactions.message);
            } else {
              publish(PubSubChannels.Transactions);
              onCompleted();
            }
          },
          variables: {
            transactions: transactions.map((transaction) => ({
              ...transaction,
              category: key.toString(),
            })),
          },
        });
      }
    },
    [
      commitAllMutation,
      commitMutation,
      filters,
      onCompleted,
      publish,
      transactions,
    ],
  );

  return (
    <Autocomplete
      autoFocus
      className="max-w-xs"
      errorMessage={error}
      isDisabled={
        isMutationInFlight || isMutationAllInFlight || transactions.length == 0
      }
      isInvalid={error != null}
      items={categories ?? []}
      label="Update category"
      onInputChange={onInputChange}
      onSelectionChange={onSelect}
      popoverProps={{
        classNames: {
          content: "w-[450px]",
        },
      }}
      selectedKey={selectedKey}
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
