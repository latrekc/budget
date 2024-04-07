import { AmountRelation } from "@/lib/types";

export type FiltersState = {
  amount: null | string;
  amountRelation: AmountRelation | null;
  categories: ReadonlyArray<string> | null;
  ignoreCategories: ReadonlyArray<string> | null;
  months: ReadonlyArray<string> | null;
  onlyIncome: boolean;
  onlyUncomplited: boolean;
  search: null | string;
  sources: ReadonlyArray<string> | null;
};

export enum FiltersReducerActionType {
  toggleOnlyIncome,
  toggleOnlyUncomplited,
  setAmount,
  setSources,
  setMonths,
  setSearch,
  setCategories,
  setIgnoreCategories,
  setAmountRelation,
}

export type FiltersReducerAction =
  | {
      payload: FiltersState["amount"];
      type: FiltersReducerActionType.setAmount;
    }
  | {
      payload: FiltersState["amountRelation"];
      type: FiltersReducerActionType.setAmountRelation;
    }
  | {
      payload: FiltersState["categories"];
      type: FiltersReducerActionType.setCategories;
    }
  | {
      payload: FiltersState["ignoreCategories"];
      type: FiltersReducerActionType.setIgnoreCategories;
    }
  | {
      payload: FiltersState["months"];
      type: FiltersReducerActionType.setMonths;
    }
  | {
      payload: FiltersState["search"];
      type: FiltersReducerActionType.setSearch;
    }
  | {
      payload: FiltersState["sources"];
      type: FiltersReducerActionType.setSources;
    }
  | {
      type: FiltersReducerActionType.toggleOnlyIncome;
    }
  | {
      type: FiltersReducerActionType.toggleOnlyUncomplited;
    };

export const initialState: FiltersState = {
  amount: null,
  amountRelation: null,
  categories: null,
  ignoreCategories: null,
  months: null,
  onlyIncome: false,
  onlyUncomplited: false,
  search: null,
  sources: null,
};

export default function TransactionsFiltersReducer(
  state: FiltersState,
  action: FiltersReducerAction,
) {
  switch (action.type) {
    case FiltersReducerActionType.toggleOnlyIncome:
      return {
        ...state,
        onlyIncome: !state.onlyIncome,
      };
    case FiltersReducerActionType.toggleOnlyUncomplited:
      return {
        ...state,
        onlyUncomplited: !state.onlyUncomplited,
      };

    case FiltersReducerActionType.setAmount:
      return {
        ...state,
        amount: action.payload,
      };
    case FiltersReducerActionType.setAmountRelation:
      return {
        ...state,
        amountRelation: action.payload,
      };

    case FiltersReducerActionType.setSources:
      return {
        ...state,
        sources: action.payload,
      };

    case FiltersReducerActionType.setMonths:
      return {
        ...state,
        months: action.payload,
      };

    case FiltersReducerActionType.setSearch:
      return {
        ...state,
        search: action.payload,
      };

    case FiltersReducerActionType.setCategories:
      return {
        ...state,
        categories: action.payload,
      };
    case FiltersReducerActionType.setIgnoreCategories:
      return {
        ...state,
        ignoreCategories: action.payload,
      };
  }
}
