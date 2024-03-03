import { AmountRelation } from "@/lib/types";

export type FiltersState = {
  amount: null | string;
  amountRelation: AmountRelation | null;
  categories: ReadonlyArray<string> | null;
  months: ReadonlyArray<string> | null;
  onlyIncome: boolean;
  onlyUncomplited: boolean;
  search: null | string;
  sources: ReadonlyArray<string> | null;
};

export enum ReducerActionType {
  toggleOnlyIncome,
  toggleOnlyUncomplited,
  setAmount,
  setSources,
  setMonths,
  setSearch,
  setCategories,
  setAmountRelation,
}

export type ReducerAction =
  | {
      payload: FiltersState["amountRelation"];
      type: ReducerActionType.setAmountRelation;
    }
  | {
      payload: FiltersState["categories"];
      type: ReducerActionType.setCategories;
    }
  | {
      type: ReducerActionType.toggleOnlyIncome;
    }
  | {
      type: ReducerActionType.toggleOnlyUncomplited;
    }
  | { payload: FiltersState["amount"]; type: ReducerActionType.setAmount }
  | { payload: FiltersState["months"]; type: ReducerActionType.setMonths }
  | { payload: FiltersState["search"]; type: ReducerActionType.setSearch }
  | { payload: FiltersState["sources"]; type: ReducerActionType.setSources };

export const initialState: FiltersState = {
  amount: null,
  amountRelation: null,
  categories: null,
  months: null,
  onlyIncome: false,
  onlyUncomplited: false,
  search: null,
  sources: null,
};

export default function TransactionsFiltersReducer(
  state: FiltersState,
  action: ReducerAction,
) {
  switch (action.type) {
    case ReducerActionType.toggleOnlyIncome:
      return {
        ...state,
        onlyIncome: !state.onlyIncome,
      };
    case ReducerActionType.toggleOnlyUncomplited:
      return {
        ...state,
        onlyUncomplited: !state.onlyUncomplited,
      };

    case ReducerActionType.setAmount:
      return {
        ...state,
        amount: action.payload,
      };
    case ReducerActionType.setAmountRelation:
      return {
        ...state,
        amountRelation: action.payload,
      };

    case ReducerActionType.setSources:
      return {
        ...state,
        sources: action.payload,
      };

    case ReducerActionType.setMonths:
      return {
        ...state,
        months: action.payload,
      };

    case ReducerActionType.setSearch:
      return {
        ...state,
        search: action.payload,
      };

    case ReducerActionType.setCategories:
      return {
        ...state,
        categories: action.payload,
      };
  }
}
