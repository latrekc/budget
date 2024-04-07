import { FiltersState } from "../TransactionsFiltersReducer";
import TransactionCategoryAutocomplete from "../category/TransactionCategoryAutocomplete";
import useTransactionSetCategory from "../useTransactionSetCategory";

export default function TransactionSetCategoryButton({
  filters,
  onCompleted,
  transactions,
}: {
  filters?: FiltersState;
  onCompleted: () => void;
  transactions: "all" | { amount: number; transaction: string }[];
}) {
  const { error, isMutationInFlight, onSave } = useTransactionSetCategory({
    filters,
    onCompleted,
    transactions,
  });

  return (
    <TransactionCategoryAutocomplete
      error={error}
      isDisabled={isMutationInFlight || transactions.length == 0}
      label="Update category"
      onSelect={onSave}
    />
  );
}
