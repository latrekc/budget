import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useMemo, useReducer, useState } from "react";
import { LuSplit } from "react-icons/lu";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

import AmountValue from "@/components/AmountValue";
import { TiPlus } from "react-icons/ti";
import CategoryAutocomplete from "../../../Categories/CategoryAutocomplete";
import CategoryChip from "../../../Categories/CategoryChip";
import SplitCategoryReducer, {
  SplitCategoryReducerActionType,
} from "../../TransactionsSplitCategoryReducer";
import useTransactionSetCategory from "../../useTransactionSetCategory";
import { TransactionCellSplitCategoryButton$key } from "./__generated__/TransactionCellSplitCategoryButton.graphql";
import { TransactionCellSplitCategoryButtonQuery } from "./__generated__/TransactionCellSplitCategoryButtonQuery.graphql";

export default function TransactionCellSplitCategoryButton({
  transaction: transaction$key,
}: {
  transaction: TransactionCellSplitCategoryButton$key;
}) {
  const { categories: allCategories } =
    useLazyLoadQuery<TransactionCellSplitCategoryButtonQuery>(
      graphql`
        query TransactionCellSplitCategoryButtonQuery {
          categories {
            id @required(action: THROW)
            ...CategoryChip
          }
        }
      `,
      {},
      { fetchPolicy: "store-and-network" },
    );

  const {
    amount,
    categories,
    currency,
    id: transaction,
  } = useFragment(
    graphql`
      fragment TransactionCellSplitCategoryButton on Transaction {
        id @required(action: THROW)
        amount @required(action: THROW)
        currency @required(action: THROW)
        categories @required(action: THROW) {
          category @required(action: THROW) {
            id @required(action: THROW)
          }
          amount @required(action: THROW)
        }
      }
    `,
    transaction$key,
  );

  const rest = useMemo(() => {
    return (
      (Math.abs(amount) * 100 -
        categories.reduce((sum, category) => {
          return (sum * 100 + Math.abs(category.amount) * 100) / 100;
        }, 0) *
          100) /
      100
    );
  }, [amount, categories]);

  const initialState = useMemo(
    () => ({
      categories: categories.map(({ amount, category: { id } }) => ({
        amounts: [amount],
        id,
      })),
      rest,
      total: Math.abs(amount),
    }),
    [amount, categories, rest],
  );

  const [split, dispatch] = useReducer(SplitCategoryReducer, initialState);

  const onSelect = useCallback(
    (key: React.Key | null) =>
      dispatch({
        payload: { amounts: [split.rest], id: (key ?? "").toString() },
        type: SplitCategoryReducerActionType.AddCategory,
      }),
    [split.rest],
  );
  const [isOpen, setIsOpen] = useState(false);
  const transactions = useMemo(
    () =>
      split.categories.map(({ amounts, id }) => ({
        amount: amounts.reduce((sum, amount) => sum + amount, 0),
        category: id,
        transaction,
      })),
    [split.categories, transaction],
  );

  const { error, isMutationInFlight, onSave } = useTransactionSetCategory({
    onCompleted: () => setIsOpen(false),
    transactions,
  });

  return (
    <Popover
      autoFocus
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() =>
        dispatch({
          payload: initialState,
          type: SplitCategoryReducerActionType.ResetState,
        })
      }
      onOpenChange={(open) => setIsOpen(open)}
      showArrow
    >
      <PopoverTrigger>
        <Button
          className="p-0"
          isIconOnly
          size="sm"
          title="Split category"
          variant="flat"
        >
          <LuSplit size="1em" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[550px]">
        {() => (
          <div className="w-full p-4">
            {split.categories.map(({ amounts, id }) => {
              const category = allCategories?.find(
                (record) => record.id === id,
              );
              if (category == null) {
                throw new Error(`Category {id} is not found`);
              }

              return (
                <div
                  className="flex w-full flex-row flex-wrap items-stretch justify-end gap-2 py-2"
                  key={category.id}
                >
                  <div className="grow">
                    <div className="justify-self-start">
                      <CategoryChip
                        category={category}
                        onDelete={() =>
                          dispatch({
                            payload: { id },
                            type: SplitCategoryReducerActionType.RemoveCategory,
                          })
                        }
                      />
                    </div>
                  </div>
                  {amounts.map((amount, index) => (
                    <>
                      {index > 0 ? (
                        <div className="self-center">
                          <TiPlus size="1em" />
                        </div>
                      ) : null}
                      <input
                        autoFocus
                        className="w-20 rounded border-0 bg-gray-200 text-right text-base "
                        inputMode="decimal"
                        key={index}
                        onChange={(e) =>
                          dispatch({
                            payload: {
                              amounts: [...amounts.keys()]
                                .filter(
                                  (origIndex) =>
                                    origIndex !== index ||
                                    e.currentTarget.value.length > 0 ||
                                    amounts.length === 1,
                                )
                                .map((origIndex) =>
                                  origIndex === index
                                    ? parseFloat(e.currentTarget.value)
                                    : amounts[origIndex],
                                ),
                              id,
                            },
                            type: SplitCategoryReducerActionType.UpdateCategory,
                          })
                        }
                        type="number"
                        value={Math.abs(amount)}
                      />
                    </>
                  ))}
                  {split.rest !== 0 &&
                  amounts.filter((amount) => isNaN(amount)).length < 1 ? (
                    <Button
                      className="p-0"
                      isIconOnly
                      onClick={() => {
                        dispatch({
                          payload: {
                            amounts: amounts.concat(NaN),
                            id,
                          },
                          type: SplitCategoryReducerActionType.UpdateCategory,
                        });
                      }}
                      size="sm"
                      title="Set category"
                      variant="flat"
                    >
                      <TiPlus size="1em" />
                    </Button>
                  ) : null}
                </div>
              );
            })}
            <div className="flex w-full flex-row flex-wrap items-center justify-between gap-x-2 py-2">
              <CategoryAutocomplete
                autoFocus={true}
                error={error}
                isSmall
                label="Uncategorised"
                onSelect={onSelect}
              />
              {split.rest !== 0 ? (
                <AmountValue abs amount={split.rest} currency={currency} />
              ) : null}
            </div>
            <div className="text-end">
              <Button
                color="primary"
                isDisabled={isNaN(split.rest) || isMutationInFlight}
                onClick={() => onSave("null")}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}