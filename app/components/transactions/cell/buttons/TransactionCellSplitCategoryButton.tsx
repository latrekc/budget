import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useMemo } from "react";
import { LuSplit } from "react-icons/lu";
import { graphql, useFragment } from "react-relay";
import TransactionCategoryChip from "../../category/TransactionCategoryChip";
import { TransactionCellSplitCategoryButton$key } from "./__generated__/TransactionCellSplitCategoryButton.graphql";

export default function TransactionCellSplitCategoryButton({
  transaction: transaction$key,
}: {
  transaction: TransactionCellSplitCategoryButton$key;
}) {
  const { categories, amount } = useFragment(
    graphql`
      fragment TransactionCellSplitCategoryButton on Transaction {
        id
        amount
        categories {
          category {
            ...TransactionCategoryChip_category
            id
          }
          amount
        }
      }
    `,
    transaction$key,
  );

  const rest = useMemo(() => {
    return (
      (Math.abs(amount) * 100 -
        categories.reduce((sum, category) => {
          return (sum * 100 + category.amount * 100) / 100;
        }, 0) *
          100) /
      100
    );
  }, [amount, categories]);

  return (
    <Popover showArrow backdrop="opaque">
      <PopoverTrigger>
        <Button
          size="sm"
          variant="flat"
          isIconOnly
          title="Split category"
          className="p-0"
        >
          <LuSplit size="1em" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[450px]">
        {() => (
          <div className="w-full p-4">
            <div>
              {categories.map(({ category, amount }) => (
                <div
                  key={category.id}
                  className="flex w-full flex-row flex-wrap justify-between gap-x-2 py-2"
                >
                  <TransactionCategoryChip category={category} />

                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    className="w-20 rounded border-0 bg-gray-200 text-right text-base"
                  />
                </div>
              ))}
              {rest > 0 ? (
                <div className="flex w-full flex-row flex-wrap justify-between gap-x-2 py-2">
                  <div>xxx</div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={rest}
                    className="w-20 rounded border-0 bg-gray-200 text-right text-base"
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
