export type FiltersState = {
  onlyUncomplited: boolean;
  sources: ReadonlyArray<string> | null;
  month: string | null;
  search: string | null;
};

export enum ReducerActionType {
  toggleOnlyUncomplited,
  setSources,
  setMonth,
  setSearch,
}

export type ReducerAction =
  | {
      type: ReducerActionType.toggleOnlyUncomplited;
    }
  | { type: ReducerActionType.setSources; payload: FiltersState["sources"] }
  | { type: ReducerActionType.setMonth; payload: FiltersState["month"] }
  | { type: ReducerActionType.setSearch; payload: FiltersState["search"] };

export const initialState: FiltersState = {
  onlyUncomplited: false,
  sources: null,
  month: null,
  search: null,
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
  }
}
