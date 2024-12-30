import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { LuSplit } from "react-icons/lu";
import { graphql, useFragment, useRefetchableFragment } from "react-relay";

import AmountValue from "@/components/AmountValue";
import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { TiPlus } from "react-icons/ti";
import CategoryAutocomplete from "../../../Categories/CategoryAutocomplete";
import CategoryChip from "../../../Categories/CategoryChip";
import SplitCategoryReducer, {
  SplitCategoryReducerActionType,
} from "../../TransactionsSplitCategoryReducer";
import useTransactionSetCategory from "../../useTransactionSetCategory";
import { TransactionCellSplitCategoryButton$key } from "./__generated__/TransactionCellSplitCategoryButton.graphql";
import { TransactionCellSplitCategoryButton_Categories$key } from "./__generated__/TransactionCellSplitCategoryButton_Categories.graphql";

export default function TransactionCellSplitCategoryButton({
  categories: categories$key,
  transaction: transaction$key,
}: {
  categories: TransactionCellSplitCategoryButton_Categories$key;
  transaction: TransactionCellSplitCategoryButton$key;
}) {
  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionCellSplitCategoryButton_Categories on Query
      @refetchable(
        queryName: "TransactionCellSplitCategoryButtonRefetchQuery"
      ) {
        categories(filters: $categoryFilters) {
          id @required(action: THROW)
          ...CategoryChip
        }
        ...CategoryAutocomplete
      }
    `,
    categories$key,
  );

  const { categories: allCategories } = data;

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Categories, () => {
      console.log("Refetch categories for TransactionCellSplitCategoryButton");
      refetch({}, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

  const {
    categories,
    currency,
    id: transaction,
    quantity,
  } = useFragment(
    graphql`
      fragment TransactionCellSplitCategoryButton on Transaction {
        id @required(action: THROW)
        quantity @required(action: THROW)
        currency @required(action: THROW)
        categories @required(action: THROW) {
          category @required(action: THROW) {
            id @required(action: THROW)
          }
          quantity @required(action: THROW)
        }
      }
    `,
    transaction$key,
  );

  const rest = useMemo(() => {
    return (
      Math.abs(quantity) -
      categories.reduce((sum, category) => {
        return sum + Math.abs(category.quantity);
      }, 0)
    );
  }, [quantity, categories]);

  const initialState = useMemo(
    () => ({
      categories: categories.map(({ category: { id }, quantity }) => ({
        id,
        quantities: [quantity],
      })),
      rest,
      total: Math.abs(quantity),
    }),
    [quantity, categories, rest],
  );

  const [split, dispatch] = useReducer(SplitCategoryReducer, initialState);

  const onSelect = useCallback(
    (key: React.Key | null) =>
      dispatch({
        payload: { id: (key ?? "").toString(), quantities: [split.rest] },
        type: SplitCategoryReducerActionType.AddCategory,
      }),
    [split.rest],
  );
  const [isOpen, setIsOpen] = useState(false);
  const transactions = useMemo(
    () =>
      split.categories.map(({ id, quantities }) => ({
        category: id,
        quantity: quantities.reduce((sum, quantity) => sum + quantity, 0),
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
            {split.categories.map(({ id, quantities }) => {
              const category = allCategories?.find(
                (record) => record.id === id,
              );
              if (category == null) {
                throw new Error(`Category ${id} is not found`);
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
                  {quantities.map((quantity, index) => (
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
                              id,
                              quantities: [...quantities.keys()]
                                .filter(
                                  (origIndex) =>
                                    origIndex !== index ||
                                    e.currentTarget.value.length > 0 ||
                                    quantities.length === 1,
                                )
                                .map((origIndex) =>
                                  origIndex === index
                                    ? parseFloat(e.currentTarget.value)
                                    : quantities[origIndex],
                                ),
                            },
                            type: SplitCategoryReducerActionType.UpdateCategory,
                          })
                        }
                        type="number"
                        value={Math.abs(quantity)}
                      />
                    </>
                  ))}
                  {split.rest !== 0 &&
                  quantities.filter((quantity) => isNaN(quantity)).length <
                    1 ? (
                    <Button
                      className="p-0"
                      isIconOnly
                      onClick={() => {
                        dispatch({
                          payload: {
                            id,
                            quantities: quantities.concat(NaN),
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
                categories={data}
                error={error}
                isSmall
                label="Uncategorised"
                onSelect={onSelect}
              />
              {split.rest !== 0 ? (
                <AmountValue abs currency={currency} quantity={split.rest} />
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
