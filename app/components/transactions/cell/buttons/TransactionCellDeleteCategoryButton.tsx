import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { useButton } from "@nextui-org/react";
import { useCallback, useRef, useState } from "react";
import { TiDelete } from "react-icons/ti";
import { graphql, useFragment, useMutation } from "react-relay";
import { TransactionCellDeleteCategoryButton$key } from "./__generated__/TransactionCellDeleteCategoryButton.graphql";
import { TransactionCellDeleteCategoryButtonMutation } from "./__generated__/TransactionCellDeleteCategoryButtonMutation.graphql";

export default function TransactionCellDeleteCategoryButton({
  record: record$key,
}: {
  record: TransactionCellDeleteCategoryButton$key;
}) {
  const { publish } = usePubSub();
  const record = useFragment(
    graphql`
      fragment TransactionCellDeleteCategoryButton on TransactionsOnCategories {
        category {
          id
        }
        transaction {
          id
        }
      }
    `,
    record$key,
  );

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<TransactionCellDeleteCategoryButtonMutation>(graphql`
      mutation TransactionCellDeleteCategoryButtonMutation(
        $transactions: [updateCategoriesForTransactionsInput!]!
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
      variables: {
        transactions: [
          {
            transaction: record.transaction.id,
            category: record.category.id,
            amount: 0,
          },
        ],
      },
      onCompleted() {
        publish(PubSubChannels.Transactions);
      },
    });
  }, []);

  const ref = useRef(null);

  const { getButtonProps } = useButton({
    ref,
    onClick: onDelete,
  });

  const [isHover, setIsHover] = useState(false);

  return (
    <button
      ref={ref}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      {...getButtonProps()}
      disabled={isDeleteMutationInFlight}
      title="Remove category"
      className="p-0 px-1"
    >
      <TiDelete color={isHover ? "#ccc" : "white"} size="1.2em" />
    </button>
  );
}
