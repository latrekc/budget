"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";

import { graphql, useFragment } from "react-relay";
import TransactionSetCategoryButton from "../../Transactions/TransactionSetCategoryButton";
import { TransactionsSelection } from "../../Transactions/TransactionsTable";
import { FiltersState } from "../FiltersReducer";
import { CategoriesFilter_Categories$key } from "./__generated__/CategoriesFilter_Categories.graphql";

export default function CategoriesFilter({
  categories: categories$key,
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
  categories: CategoriesFilter_Categories$key;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = useFragment(
    graphql`
      fragment CategoriesFilter_Categories on Query {
        ...TransactionSetCategoryButton_Categories
      }
    `,
    categories$key,
  );

  const transactions = useMemo(() => {
    if (selectedTransactions === "all") {
      return "all";
    }

    if (selectedTransactions instanceof Set) {
      return [...selectedTransactions.values()];
    }
    return [];
  }, [selectedTransactions]);

  const onSetCategories = useCallback(() => {
    setSelectedTransactions(new Set());
    setIsOpen(false);
  }, [setSelectedTransactions]);

  return (
    <div className="inline-flex items-center justify-start gap-x-3">
      <Popover
        backdrop="opaque"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        showArrow
      >
        <PopoverTrigger onClick={() => setIsOpen(true)}>
          <Button
            color="primary"
            isDisabled={transactions.length == 0}
            size="sm"
            title="Set category"
            variant="flat"
          >
            Set category
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px]">
          {() => (
            <div className="w-full p-4">
              <TransactionSetCategoryButton
                categories={categories}
                filters={filters}
                onCompleted={onSetCategories}
                transactions={transactions}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
