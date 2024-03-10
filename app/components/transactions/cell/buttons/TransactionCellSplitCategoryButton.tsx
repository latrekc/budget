import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useMemo } from "react";
import { LuSplit } from "react-icons/lu";
import { graphql, useFragment } from "react-relay";

import AmountValue from "@/components/AmountValue";
import TransactionCategoryChip from "../../category/TransactionCategoryChip";
import { TransactionCellSplitCategoryButton$key } from "./__generated__/TransactionCellSplitCategoryButton.graphql";

export default function TransactionCellSplitCategoryButton({
  transaction: transaction$key,
}: {
  transaction: TransactionCellSplitCategoryButton$key;
}) {
  const { amount, categories, currency } = useFragment(
    graphql`
      fragment TransactionCellSplitCategoryButton on Transaction {
        id @required(action: THROW)
        amount @required(action: THROW)
        currency @required(action: THROW)
        categories @required(action: THROW) {
          category @required(action: THROW) {
            ...TransactionCategoryChip
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

  return (
    <Popover backdrop="opaque" showArrow>
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

      <PopoverContent className="w-[450px]">
        {() => (
          <div className="w-full p-4">
            <div>
              {categories.map(({ amount, category }) => (
                <div
                  className="flex w-full flex-row flex-wrap justify-between gap-x-2 py-2"
                  key={category.id}
                >
                  <TransactionCategoryChip category={category} />

                  <input
                    className="w-20 rounded border-0 bg-gray-200 text-right text-base"
                    inputMode="decimal"
                    type="number"
                    value={Math.abs(amount)}
                  />
                </div>
              ))}
              {rest > 0 ? (
                <div className="flex w-full flex-row flex-wrap justify-between gap-x-2 py-2">
                  <div>Unmarked</div>
                  <AmountValue abs amount={rest} currency={currency} />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
