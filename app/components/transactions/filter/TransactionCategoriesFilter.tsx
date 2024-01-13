import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import { FiltersState } from "../TransactionsFiltersReducer";
import { TransactionsSelection } from "../TransactionsTable";
import TransactionSetCategoryButton from "../buttons/TransactionSetCategoryButton";

export default function TransactionCategoriesFilter({
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
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
  }, []);

  return (
    <div className="inline-flex items-center justify-start gap-x-3">
      <Popover
        showArrow
        backdrop="opaque"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <PopoverTrigger onClick={() => setIsOpen(true)}>
          <Button
            size="sm"
            variant="flat"
            title="Set category"
            color="primary"
            isDisabled={transactions.length == 0}
          >
            Set category
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[320px]">
          {() => (
            <div className="w-full p-4">
              <TransactionSetCategoryButton
                onCompleted={onSetCategories}
                transactions={transactions}
                filters={filters}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
