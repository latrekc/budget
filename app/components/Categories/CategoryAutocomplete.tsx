import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { graphql, useRefetchableFragment } from "react-relay";
import CategoryChip from "./CategoryChip";
import {
  CategoryAutocomplete$data,
  CategoryAutocomplete$key,
} from "./__generated__/CategoryAutocomplete.graphql";

type Props = {
  autoFocus?: boolean;
  categories: CategoryAutocomplete$key;
  error?: null | string;
  filterCallback?: (
    categories: CategoryAutocomplete$data["categories_for_autocomplete"],
  ) => CategoryAutocomplete$data["categories_for_autocomplete"];
  isDisabled?: boolean;
  isSmall?: boolean;
  label: string;
  onSelect: (key: React.Key | null) => void;
};

export default function CategoryAutocomplete({
  autoFocus = true,
  categories: categories$key,
  error = null,
  filterCallback,
  isDisabled = false,
  isSmall = false,
  label,
  onSelect,
}: Props) {
  const [{ categories_for_autocomplete: allCategories }, refetch] =
    useRefetchableFragment(
      graphql`
        fragment CategoryAutocomplete on Query
        @refetchable(queryName: "CategoryAutocompleteRefetchQuery") {
          categories_for_autocomplete: categories {
            id @required(action: THROW)
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
              parentCategory {
                name @required(action: THROW)
              }
            }
            ...CategoryChip
          }
        }
      `,
      categories$key,
    );

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Categories, () => {
      console.log("Refetch categories for CategoryAutocomplete");
      refetch({}, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

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
      autoFocus={autoFocus}
      className="max-w-xs"
      errorMessage={error}
      fullWidth={!isSmall}
      isClearable={false}
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
            <CategoryChip category={category} />
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
