import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import TransactionCategoryChip from "./TransactionCategoryChip";
import {
  TransactionCategoryAutocompleteQuery,
  TransactionCategoryAutocompleteQuery$data,
} from "./__generated__/TransactionCategoryAutocompleteQuery.graphql";

export default function TransactionCategoryAutocomplete({
  error = null,
  filterCallback,
  isDisabled = false,
  isSmall = false,
  label,
  onSelect,
}: {
  error?: null | string;
  filterCallback?: (
    categories: TransactionCategoryAutocompleteQuery$data["categories"],
  ) => TransactionCategoryAutocompleteQuery$data["categories"];
  isDisabled?: boolean;
  isSmall?: boolean;
  label: string;
  onSelect: (key: React.Key) => void;
}) {
  const { categories: allCategories } =
    useLazyLoadQuery<TransactionCategoryAutocompleteQuery>(
      graphql`
        query TransactionCategoryAutocompleteQuery {
          categories {
            id @required(action: THROW)
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
              parentCategory {
                name @required(action: THROW)
              }
            }
            ...TransactionCategoryChip
          }
        }
      `,
      {},
      { fetchPolicy: "store-and-network" },
    );

  const filteredCategories = useMemo(
    () =>
      filterCallback != null ? filterCallback(allCategories) : allCategories,
    [allCategories, filterCallback],
  );

  const [categories, setCategories] = useState(filteredCategories);

  const onInputChange = useCallback(
    (searchTerm: string) => {
      setCategories(
        searchTerm.length > 0
          ? filteredCategories?.filter(
              ({ name, parentCategory }) =>
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parentCategory?.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                parentCategory?.parentCategory?.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            )
          : filteredCategories,
      );
    },
    [filteredCategories],
  );

  return (
    <Autocomplete
      autoFocus
      className="max-w-xs"
      errorMessage={error}
      fullWidth={!isSmall}
      isDisabled={isDisabled}
      isInvalid={error != null}
      items={categories ?? []}
      label={label}
      menuTrigger="input"
      onInputChange={onInputChange}
      onSelectionChange={onSelect}
      placeholder="Select category"
      popoverProps={{
        classNames: {
          content: "w-[450px]",
        },
      }}
      size={isSmall ? "sm" : "md"}
    >
      {(category) => (
        <AutocompleteItem key={category.id} value={category.id}>
          <div className="flex shrink flex-row flex-wrap">
            <TransactionCategoryChip category={category} />
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
