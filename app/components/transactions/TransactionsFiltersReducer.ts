export type FiltersState = {
  categories: ReadonlyArray<string> | null;
  months: ReadonlyArray<string> | null;
  onlyUncomplited: boolean;
  search: null | string;
  sources: ReadonlyArray<string> | null;
};

export enum ReducerActionType {
  toggleOnlyUncomplited,
  setSources,
  setMonths,
  setSearch,
  setCategories,
}

export type ReducerAction =
  | {
      payload: FiltersState["categories"];
      type: ReducerActionType.setCategories;
    }
  | {
      type: ReducerActionType.toggleOnlyUncomplited;
    }
  | { payload: FiltersState["months"]; type: ReducerActionType.setMonths }
  | { payload: FiltersState["search"]; type: ReducerActionType.setSearch }
  | { payload: FiltersState["sources"]; type: ReducerActionType.setSources };

export const initialState: FiltersState = {
  categories: null,
  months: null,
  onlyUncomplited: false,
  search: null,
  sources: null,
};

export default function TransactionsFiltersReducer(
  state: FiltersState,
  action: ReducerAction,
) {
  switch (action.type) {
    case ReducerActionType.toggleOnlyUncomplited:
      return {
        ...state,
        onlyUncomplited: !state.onlyUncomplited,
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
