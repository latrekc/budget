import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useMemo, useReducer } from "react";
import { LuSplit } from "react-icons/lu";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

import AmountValue from "@/components/AmountValue";
import SplitCategoryReducer, {
  SplitCategoryReducerActionType,
} from "../../TransactionsSplitCategoryReducer";
import TransactionCategoryAutocomplete from "../../category/TransactionCategoryAutocomplete";
import TransactionCategoryChip from "../../category/TransactionCategoryChip";
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
            ...TransactionCategoryChip
          }
        }
      `,
      {},
      { fetchPolicy: "store-and-network" },
    );

  const { amount, categories, currency } = useFragment(
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
        amount,
        id,
      })),
      rest,
      total: Math.abs(amount),
    }),
    [amount, categories, rest],
  );

  const [split, dispatch] = useReducer(SplitCategoryReducer, initialState);

  const onSelect = useCallback(
    (key: React.Key) =>
      dispatch({
        payload: { amount: split.rest, id: key.toString() },
        type: SplitCategoryReducerActionType.addCategory,
      }),
    [split.rest],
  );

  return (
    <Popover
      backdrop="opaque"
      onClose={() =>
        dispatch({
          payload: initialState,
          type: SplitCategoryReducerActionType.resetState,
        })
      }
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
            {split.categories.map(({ amount, id }) => {
              const category = allCategories?.find(
                (record) => record.id === id,
              );
              if (category == null) {
                throw new Error(`Category {id} is not found`);
              }

              return (
                <div
                  className="flex w-full flex-row flex-wrap justify-between gap-x-2 py-2"
                  key={category.id}
                >
                  <TransactionCategoryChip
                    category={category}
                    onDelete={() =>
                      dispatch({
                        payload: { id },
                        type: SplitCategoryReducerActionType.removeCategory,
                      })
                    }
                  />
                  <input
                    className="w-20 rounded border-0 bg-gray-200 text-right text-base"
                    inputMode="decimal"
                    onChange={(e) =>
                      dispatch({
                        payload: {
                          amount: parseFloat(e.currentTarget.value),
                          id,
                        },
                        type: SplitCategoryReducerActionType.updateCategory,
                      })
                    }
                    type="number"
                    value={Math.abs(amount)}
                  />
                </div>
              );
            })}
            {split.rest !== 0 ? (
              <div className="flex w-full flex-row flex-wrap items-center justify-between gap-x-2 py-2">
                <TransactionCategoryAutocomplete
                  isSmall
                  label="Uncategorised"
                  onSelect={onSelect}
                />
                <AmountValue abs amount={split.rest} currency={currency} />
              </div>
            ) : null}
            <div className="text-end">
              <Button color="primary" isDisabled={isNaN(split.rest)}>
                Save
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
