import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useCallback } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { useTransactionCellDeleteCategoryButton$key } from "./__generated__/useTransactionCellDeleteCategoryButton.graphql";
import { useTransactionCellDeleteCategoryButtonMutation } from "./__generated__/useTransactionCellDeleteCategoryButtonMutation.graphql";

export default function useTransactionCellDeleteCategoryButton(
  record$key: useTransactionCellDeleteCategoryButton$key,
) {
  const { publish } = usePubSub();
  const record = useFragment(
    graphql`
      fragment useTransactionCellDeleteCategoryButton on TransactionsOnCategories {
        category @required(action: THROW) {
          id @required(action: THROW)
        }
        transaction @required(action: THROW) {
          id @required(action: THROW)
        }
      }
    `,
    record$key,
  );

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<useTransactionCellDeleteCategoryButtonMutation>(graphql`
      mutation useTransactionCellDeleteCategoryButtonMutation(
        $transactions: [UpdateCategoriesForTransactionsInput!]!
      ) {
        deleteCategoriesForTransactions(transactions: $transactions) {
          ... on MutationDeleteCategoriesForTransactionsSuccess {
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
        }
      }
    `);

  const onDelete = useCallback(() => {
    commitDeleteMutation({
      onCompleted() {
        publish(PubSubChannels.Transactions);
      },
      variables: {
        transactions: [
          {
            amount: 0,
            category: record.category.id,
            transaction: record.transaction.id,
          },
        ],
      },
    });
  }, [
    commitDeleteMutation,
    publish,
    record.category.id,
    record.transaction.id,
  ]);

  return { isDisabledDelete: isDeleteMutationInFlight, onDelete };
}
