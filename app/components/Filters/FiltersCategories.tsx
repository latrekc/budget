import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { CheckboxGroup, Input, Radio, RadioGroup } from "@nextui-org/react";
import {
  Dispatch,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { graphql, useFragment, useRefetchableFragment } from "react-relay";

import Category from "../Categories/Category";
import CategoryChip from "../Categories/CategoryChip";
import CategoryAddButton from "../Categories/buttons/CategoryAddButton";
import {
  FiltersReducerAction,
  FiltersReducerActionType,
  FiltersState,
  initialState,
} from "./FiltersReducer";
import {
  FiltersCategories$data,
  FiltersCategories$key,
} from "./__generated__/FiltersCategories.graphql";
import { FiltersCategories_Categories$key } from "./__generated__/FiltersCategories_Categories.graphql";

export enum CategoryMode {
  "EDIT" = "EDIT",
  "IGNORE" = "IGNORE",
  "SELECT" = "SELECT",
}

export const CategoriesContext = createContext<{
  categoryMode: CategoryMode;
  filterName: string;
  filters: FiltersState;
}>({
  categoryMode: CategoryMode.SELECT,
  filterName: "",
  filters: initialState,
});

type Categories = FiltersCategories$data["categories"];

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

export default function FiltersCategories({
  categories: categories$key,
  dispatch,
  filterCategories: filterCategories$key,
  filters,
}: {
  categories: FiltersCategories_Categories$key;
  dispatch: Dispatch<FiltersReducerAction>;
  filterCategories: FiltersCategories$key;
  filters: FiltersState;
}) {
  const [categoryMode, setCategoryMode] = useState<CategoryMode>(
    CategoryMode.SELECT,
  );

  const onSetCategoryMode = useCallback(
    (value: string) => setCategoryMode(value as CategoryMode),
    [],
  );

  const [{ categories: allCategories }, refetch] = useRefetchableFragment(
    graphql`
      fragment FiltersCategories on Query
      @refetchable(queryName: "FiltersCategoriesRefetchQuery") {
        categories(filters: $categoryFilters) {
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
          ...Category
          ...CategoryChip
        }
      }
    `,
    filterCategories$key,
  );

  const categories = useFragment(
    graphql`
      fragment FiltersCategories_Categories on Query {
        ...Category_Categories
      }
    `,
    categories$key,
  );

  const [filterName, setFilterName] = useState("");

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Categories, () => {
      console.log("Refetch categories for FiltersCategories");
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
        type:
          categoryMode === CategoryMode.SELECT
            ? FiltersReducerActionType.SetCategories
            : FiltersReducerActionType.SetIgnoreCategories,
      });
    },
    [allCategories, categoryMode, dispatch],
  );

  const value = useMemo(
    () =>
      categoryMode === CategoryMode.SELECT
        ? filters.categories != null
          ? [...filters.categories]
          : []
        : filters.ignoreCategories != null
          ? [...filters.ignoreCategories]
          : [],
    [categoryMode, filters.categories, filters.ignoreCategories],
  );

  const filteredCategories = useMemo(
    () => filterByName(allCategories, filterName) ?? [],
    [allCategories, filterName],
  );

  const onRemove = useCallback(
    (toRemove: string, mode: CategoryMode) => {
      if (mode === CategoryMode.SELECT) {
        const newValue = filters.categories!.filter(
          (item) => item !== toRemove,
        );

        dispatch({
          payload: newValue.length ? newValue : null,
          type: FiltersReducerActionType.SetCategories,
        });
      } else {
        const newValue = filters.ignoreCategories!.filter(
          (item) => item !== toRemove,
        );

        dispatch({
          payload: newValue.length ? newValue : null,
          type: FiltersReducerActionType.SetIgnoreCategories,
        });
      }
    },
    [dispatch, filters.categories, filters.ignoreCategories],
  );

  return (
    <CategoriesContext.Provider value={{ categoryMode, filterName, filters }}>
      <div className="max-h-[720px] min-h-[720px] overflow-scroll">
        {(filters.categories || filters.ignoreCategories) && (
          <div className="inline-flex flex-wrap items-center justify-start gap-2 py-2">
            {filters.categories?.map((categoryId) => {
              const category = allCategories?.find(
                ({ id }) => id === categoryId,
              );
              if (!category) {
                return null;
              }
              return (
                <CategoryChip
                  category={category}
                  key={categoryId}
                  onDelete={() => onRemove(categoryId, CategoryMode.SELECT)}
                />
              );
            })}

            {filters.ignoreCategories?.map((categoryId) => {
              const category = allCategories?.find(
                ({ id }) => id === categoryId,
              );
              if (!category) {
                return null;
              }
              return (
                <CategoryChip
                  category={category}
                  ignore={true}
                  key={categoryId}
                  onDelete={() => onRemove(categoryId, CategoryMode.IGNORE)}
                />
              );
            })}
          </div>
        )}

        <Input
          label="Filter by name"
          onValueChange={setFilterName}
          value={filterName}
        />

        <RadioGroup
          className="py-6"
          onValueChange={onSetCategoryMode}
          orientation="horizontal"
          value={categoryMode}
        >
          <Radio value={CategoryMode.EDIT}>Edit</Radio>
          <Radio value={CategoryMode.SELECT}>Select</Radio>
          <Radio value={CategoryMode.IGNORE}>Ignore</Radio>
        </RadioGroup>

        <CheckboxGroup onValueChange={setSelected} value={value}>
          {filteredCategories
            ?.filter((category) => category.parentCategory == null)
            .map((category) => (
              <Category
                categories={categories}
                category={category}
                key={category.id}
              />
            ))}
        </CheckboxGroup>

        {categoryMode === CategoryMode.EDIT && (
          <div className="p-4">
            <CategoryAddButton withLabel />
          </div>
        )}
      </div>
    </CategoriesContext.Provider>
  );
}
