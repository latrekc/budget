import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { CheckboxGroup, Input, Switch } from "@nextui-org/react";
import {
  Dispatch,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "./TransactionsFiltersReducer";
import {
  TransactionsCategories$data,
  TransactionsCategories$key,
} from "./__generated__/TransactionsCategories.graphql";
import TransactionCategory from "./category/TransactionCategory";
import TransactionCategoryChip from "./category/TransactionCategoryChip";
import TransactionAddButton from "./category/buttons/TransactionCategoryAddButton";

export const CategoriesContext = createContext<{
  editMode: boolean;
  filterName: string;
}>({
  editMode: false,
  filterName: "",
});

type Categories = TransactionsCategories$data["categories"];

function filterByName(allCategories: Categories, searchTerm: string) {
  const test = (name: string | undefined) =>
    name?.toLowerCase().includes(searchTerm.toLowerCase());

  return searchTerm.length > 0
    ? allCategories?.filter(
        ({ name, parentCategory, subCategories }) =>
          test(name) ||
          test(parentCategory?.name) ||
          test(parentCategory?.parentCategory?.name) ||
          subCategories?.some(
            (subCategory) =>
              test(subCategory.name) ||
              subCategory.subCategories?.some((subSubCategory) =>
                test(subSubCategory.name),
              ),
          ),
      )
    : allCategories;
}

export default function TransactionsCategories({
  categories: categories$key,
  dispatch,
  filters,
}: {
  categories: TransactionsCategories$key;
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
}) {
  const [editMode, setEditMode] = useState(false);

  const [{ categories: allCategories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsCategories on Query
      @refetchable(queryName: "TransactionsCategoriesRefetchQuery") {
        categories {
          id @required(action: THROW)
          name @required(action: THROW)
          parentCategory {
            name @required(action: THROW)
            parentCategory {
              name @required(action: THROW)
            }
          }
          subCategories {
            name @required(action: THROW)
            subCategories {
              name @required(action: THROW)
            }
          }
          ...TransactionCategory
          ...TransactionCategoryChip
        }
      }
    `,
    categories$key,
  );

  const [filterName, setFilterName] = useState("");

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Categories, () => {
      console.log("Refetch categories");
      refetch({}, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

  const setSelected = useCallback(
    (value: string[]) => {
      dispatch({
        payload:
          value.length > 0 && value.length < (allCategories ?? []).length
            ? value
            : null,
        type: ReducerActionType.setCategories,
      });
    },
    [allCategories, dispatch],
  );

  const value = useMemo(
    () => (filters.categories != null ? [...filters.categories] : []),
    [filters.categories],
  );

  const categories = useMemo(
    () => filterByName(allCategories, filterName) ?? [],
    [allCategories, filterName],
  );

  const onRemove = useCallback(
    (toRemove: string) => {
      const newValue = filters.categories!.filter((item) => item !== toRemove);

      dispatch({
        payload: newValue.length ? newValue : null,
        type: ReducerActionType.setCategories,
      });
    },
    [dispatch, filters.categories],
  );

  return (
    <CategoriesContext.Provider value={{ editMode, filterName }}>
      <div className="max-h-[720px] min-h-[720px] overflow-scroll">
        {filters.categories && (
          <div className="inline-flex flex-wrap items-center justify-start gap-2">
            {filters.categories.map((categoryId) => {
              const category = allCategories?.find(
                ({ id }) => id === categoryId,
              );
              if (!category) {
                return null;
              }
              return (
                <TransactionCategoryChip
                  category={category}
                  key={categoryId}
                  onDelete={() => onRemove(categoryId)}
                />
              );
            })}
          </div>
        )}

        <div className="flex flex-row gap-4 p-4">
          <Switch isSelected={editMode} onValueChange={setEditMode} size="sm">
            Edit
          </Switch>

          <Input
            label="Filter by name"
            onValueChange={setFilterName}
            value={filterName}
          />
        </div>

        <CheckboxGroup onValueChange={setSelected} value={value}>
          {categories
            ?.filter((category) => category.parentCategory == null)
            .map((category) => (
              <TransactionCategory category={category} key={category.id} />
            ))}
        </CheckboxGroup>

        {editMode && (
          <div className="p-4">
            <TransactionAddButton withLabel />
          </div>
        )}
      </div>
    </CategoriesContext.Provider>
  );
}
