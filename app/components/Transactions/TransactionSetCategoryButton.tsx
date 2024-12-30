import { graphql, useFragment } from "react-relay";
import CategoryAutocomplete from "../Categories/CategoryAutocomplete";
import { FiltersState } from "../Filters/FiltersReducer";
import { TransactionSetCategoryButton_Categories$key } from "./__generated__/TransactionSetCategoryButton_Categories.graphql";
import useTransactionSetCategory from "./useTransactionSetCategory";

export default function TransactionSetCategoryButton({
  categories: categories$key,
  filters,
  onCompleted,
  transactions,
}: {
  categories: TransactionSetCategoryButton_Categories$key;
  filters?: FiltersState;
  onCompleted: () => void;
  transactions: "all" | { quantity: number; transaction: string }[];
}) {
  const { error, isMutationInFlight, onSave } = useTransactionSetCategory({
    filters,
    onCompleted,
    transactions,
  });

  const categories = useFragment(
    graphql`
      fragment TransactionSetCategoryButton_Categories on Query {
        ...CategoryAutocomplete
      }
    `,
    categories$key,
  );

  return (
    <CategoryAutocomplete
      categories={categories}
      error={error}
      isDisabled={isMutationInFlight || transactions.length == 0}
      label="Update category"
      onSelect={onSave}
    />
  );
}
