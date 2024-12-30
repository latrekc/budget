import { AmountRelation, SortBy } from "@/lib/types";

export type FiltersState = {
  amountRelation: AmountRelation | null;
  categories: ReadonlyArray<string> | null;
  ignoreCategories: ReadonlyArray<string> | null;
  months: ReadonlyArray<string> | null;
  onlyIncome: boolean;
  onlyUncomplited: boolean;
  quantity: null | string;
  search: null | string;
  sortBy: SortBy | null;
  sources: ReadonlyArray<string> | null;
};

export enum FiltersReducerActionType {
  AddCategory,
  RemoveCategory,
  ToggleOnlyIncome,
  ToggleOnlyUncomplited,
  SetQuantity,
  SetSources,
  SetMonths,
  SetSearch,
  SetCategories,
  SetIgnoreCategories,
  SetAmountRelation,
  ToggleSortBy,
}

export type FiltersReducerAction =
  | {
      payload: FiltersState["amountRelation"];
      type: FiltersReducerActionType.SetAmountRelation;
    }
  | {
      payload: FiltersState["categories"];
      type: FiltersReducerActionType.SetCategories;
    }
  | {
      payload: FiltersState["ignoreCategories"];
      type: FiltersReducerActionType.SetIgnoreCategories;
    }
  | {
      payload: FiltersState["months"];
      type: FiltersReducerActionType.SetMonths;
    }
  | {
      payload: FiltersState["quantity"];
      type: FiltersReducerActionType.SetQuantity;
    }
  | {
      payload: FiltersState["search"];
      type: FiltersReducerActionType.SetSearch;
    }
  | {
      payload: FiltersState["sources"];
      type: FiltersReducerActionType.SetSources;
    }
  | {
      payload: string;
      type: FiltersReducerActionType.AddCategory;
    }
  | {
      payload: string;
      type: FiltersReducerActionType.RemoveCategory;
    }
  | {
      type: FiltersReducerActionType.ToggleOnlyIncome;
    }
  | {
      type: FiltersReducerActionType.ToggleOnlyUncomplited;
    }
  | { type: FiltersReducerActionType.ToggleSortBy };

export const initialState: FiltersState = {
  amountRelation: null,
  categories: null,
  ignoreCategories: null,
  months: null,
  onlyIncome: false,
  onlyUncomplited: false,
  quantity: null,
  search: null,
  sortBy: null,
  sources: null,
};

export default function FiltersReducer(
  state: FiltersState,
  action: FiltersReducerAction,
): FiltersState {
  switch (action.type) {
    case FiltersReducerActionType.ToggleOnlyIncome:
      return {
        ...state,
        onlyIncome: !state.onlyIncome,
      };
    case FiltersReducerActionType.ToggleOnlyUncomplited:
      return {
        ...state,
        onlyUncomplited: !state.onlyUncomplited,
      };

    case FiltersReducerActionType.SetQuantity:
      return {
        ...state,
        quantity: action.payload,
      };
    case FiltersReducerActionType.SetAmountRelation:
      return {
        ...state,
        amountRelation: action.payload,
      };

    case FiltersReducerActionType.SetSources:
      return {
        ...state,
        sources: action.payload,
      };

    case FiltersReducerActionType.SetMonths:
      return {
        ...state,
        months: action.payload,
      };

    case FiltersReducerActionType.SetSearch:
      return {
        ...state,
        search: action.payload,
      };

    case FiltersReducerActionType.SetCategories:
      return {
        ...state,
        categories: action.payload,
      };
    case FiltersReducerActionType.SetIgnoreCategories:
      return {
        ...state,
        ignoreCategories: action.payload,
      };
    case FiltersReducerActionType.AddCategory:
      return {
        ...state,
        categories: state.categories?.includes(action.payload)
          ? state.categories
          : state.categories == undefined
            ? [action.payload]
            : state.categories?.concat(action.payload),
      };
    case FiltersReducerActionType.RemoveCategory:
      return {
        ...state,
        categories: state.categories?.includes(action.payload)
          ? state.categories.filter((category) => category !== action.payload)
          : state.categories,
      };
    case FiltersReducerActionType.ToggleSortBy:
      return {
        ...state,
        sortBy: state.sortBy != SortBy.Amount ? SortBy.Amount : null,
      };
  }
}
