"use client";

import { PubSubChannels } from "@/lib/types";
import { usePubSub } from "@/lib/usePubSub";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { graphql, useRefetchableFragment } from "react-relay";

import TransactionSetCategoryButton from "../buttons/TransactionSetCategoryButton";
import TransactionCategoryChip from "../category/TransactionCategoryChip";
import {
  FiltersState,
  ReducerAction,
  ReducerActionType,
} from "../TransactionsFiltersReducer";
import { TransactionsSelection } from "../TransactionsTable";
import { TransactionCategoriesFilter$key } from "./__generated__/TransactionCategoriesFilter.graphql";

export default function TransactionCategoriesFilter({
  data: data$key,
  dispatch,
  filters,
  selectedTransactions,
  setSelectedTransactions,
}: {
  data: TransactionCategoriesFilter$key;
  dispatch: Dispatch<ReducerAction>;
  filters: FiltersState;
  selectedTransactions: TransactionsSelection;
  setSelectedTransactions: (selected: TransactionsSelection) => void;
}) {
  const [{ categories }, refetch] = useRefetchableFragment(
    graphql`
      fragment TransactionCategoriesFilter on Query
      @refetchable(queryName: "TransactionsCategoriesFilterRefetchQuery") {
        categories {
          id
          ...TransactionCategoryChip
        }
      }
    `,
    data$key,
  );

  const { subscribe } = usePubSub();

  useEffect(() => {
    return subscribe(PubSubChannels.Categories, () => {
      console.log("Refetch categories");
      refetch({}, { fetchPolicy: "network-only" });
    });
  }, [refetch, subscribe]);

  const [isOpen, setIsOpen] = useState(false);
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
      {filters.categories?.map((categoryId) => {
        const category = categories?.find(({ id }) => id === categoryId);
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
