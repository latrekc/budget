import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useCallback, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { FiltersState } from "../Filters/FiltersReducer";
import { useTransactionSetCategoryAllMutation } from "./__generated__/useTransactionSetCategoryAllMutation.graphql";
import { useTransactionSetCategoryMutation } from "./__generated__/useTransactionSetCategoryMutation.graphql";

export default function useTransactionSetCategory({
  filters,
  onCompleted,
  transactions,
}: {
  filters?: FiltersState;
  onCompleted: () => void;
  transactions:
    | "all"
    | { amount: number; category?: string; transaction: string }[];
}) {
  const { publish } = usePubSub();
  const [error, setError] = useState<null | string>(null);

  const [commitMutation, isMutationInFlight] =
    useMutation<useTransactionSetCategoryMutation>(graphql`
      mutation useTransactionSetCategoryMutation(
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
    useMutation<useTransactionSetCategoryAllMutation>(graphql`
      mutation useTransactionSetCategoryAllMutation(
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

  const onSave = useCallback(
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
              category: transaction.category ?? key.toString(),
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

  return {
    error,
    isMutationInFlight: isMutationAllInFlight || isMutationInFlight,
    onSave,
  };
}
