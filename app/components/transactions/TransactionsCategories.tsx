import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { CheckboxGroup, Switch } from "@nextui-org/react";
import {
  createContext,
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import { TransactionsCategories$key } from "./__generated__/TransactionsCategories.graphql";
import TransactionAddButton from "./category/buttons/TransactionCategoryAddButton";
import TransactionCategory from "./category/TransactionCategory";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "./TransactionsFiltersReducer";

export const CategoriesModeContext = createContext<boolean>(false);

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

  const [{ categories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsCategories on Query
      @refetchable(queryName: "TransactionsCategoriesRefetchQuery") {
        categories {
          id @required(action: THROW)
          parentCategory {
            __typename @required(action: THROW)
          }
          ...TransactionCategory
        }
      }
    `,
    categories$key,
  );

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
          value.length > 0 && value.length < (categories ?? []).length
            ? value
            : null,
        type: ReducerActionType.setCategories,
      });
    },
    [categories, dispatch],
  );

  const value = useMemo(
    () => (filters.categories != null ? [...filters.categories] : []),
    [filters.categories],
  );

  return (
    <CategoriesModeContext.Provider value={editMode}>
      <div className="max-h-[720px] min-h-[720px] overflow-scroll">
        <div className="p-4">
          <Switch isSelected={editMode} onValueChange={setEditMode} size="sm">
            Edit
          </Switch>
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
    </CategoriesModeContext.Provider>
  );
}
