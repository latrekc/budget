export type FiltersState = {
  categories: ReadonlyArray<string> | null;
  month: null | string;
  onlyUncomplited: boolean;
  search: null | string;
  sources: ReadonlyArray<string> | null;
};

export enum ReducerActionType {
  toggleOnlyUncomplited,
  setSources,
  setMonth,
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
  | { payload: FiltersState["month"]; type: ReducerActionType.setMonth }
  | { payload: FiltersState["search"]; type: ReducerActionType.setSearch }
  | { payload: FiltersState["sources"]; type: ReducerActionType.setSources };

export const initialState: FiltersState = {
  categories: null,
  month: null,
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

    case ReducerActionType.setMonth:
      return {
        ...state,
        month: action.payload,
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
