"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Dispatch, useCallback, useMemo, useState } from "react";

import TransactionSetCategoryButton from "../../Transactions/TransactionSetCategoryButton";
import { TransactionsSelection } from "../../Transactions/TransactionsTable";
import { FiltersReducerAction, FiltersState } from "../FiltersReducer";

export default function CategoriesFilter({
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
  dispatch: Dispatch<FiltersReducerAction>;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

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
