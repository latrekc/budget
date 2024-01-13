import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import { Switch } from "@nextui-org/react";
import { createContext, useEffect, useState } from "react";
import { graphql, useRefetchableFragment } from "react-relay";
import { TransactionsCategories$key } from "./__generated__/TransactionsCategories.graphql";
import TransactionCategory from "./category/TransactionCategory";
import TransactionAddButton from "./category/buttons/TransactionCategoryAddButton";

export const CategoriesModeContext = createContext<boolean>(false);

export default function TransactionsCategories({
  categories: categories$key,
}: {
  categories: TransactionsCategories$key;
}) {
  const [editMode, setEditMode] = useState(false);

  const [{ categories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionsCategories on Query
      @refetchable(queryName: "TransactionsCategoriesRefetchQuery") {
        categories {
          id
          parentCategory {
            __typename
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
  }, []);

  return (
    <CategoriesModeContext.Provider value={editMode}>
      <div className="max-h-[720px] min-h-[720px] overflow-scroll">
        <div className="p-4">
          <Switch isSelected={editMode} onValueChange={setEditMode} size="sm">
            Edit
          </Switch>
        </div>

        <div>
          {categories
            ?.filter((category) => category.parentCategory == null)
            .map((category) => (
              <TransactionCategory key={category.id} category={category} />
            ))}
        </div>

        {editMode && (
          <div className="p-4">
            <TransactionAddButton withLabel />
          </div>
        )}
      </div>
    </CategoriesModeContext.Provider>
  );
}
