import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useCallback, useState } from "react";
import { graphql, useMutation } from "react-relay";

import { FiltersState } from "../TransactionsFiltersReducer";
import TransactionCategoryAutocomplete from "../category/TransactionCategoryAutocomplete";
import { TransactionSetCategoryButtonAllMutation } from "./__generated__/TransactionSetCategoryButtonAllMutation.graphql";
import { TransactionSetCategoryButtonMutation } from "./__generated__/TransactionSetCategoryButtonMutation.graphql";

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

  const onSelect = useCallback(
    (key: React.Key) => {
      if (transactions === "all") {
        if (filters == null) {
          throw new Error("Filters state is unknown");
        }

        commitAllMutation({
          onCompleted(result) {
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
    <TransactionCategoryAutocomplete
      error={error}
      isDisabled={
        isMutationInFlight || isMutationAllInFlight || transactions.length == 0
      }
      label="Update category"
      onSelect={onSelect}
    />
  );
}
