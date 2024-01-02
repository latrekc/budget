export type ReducerState = {
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
  | { type: ReducerActionType.setSources; payload: ReducerState["sources"] }
  | { type: ReducerActionType.setMonth; payload: ReducerState["month"] }
  | { type: ReducerActionType.setSearch; payload: ReducerState["search"] };

export const initialState: ReducerState = {
  onlyUncomplited: false,
  sources: null,
  month: null,
  search: null,
};

export default function TransactionsFiltersReducer(
  state: ReducerState,
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
