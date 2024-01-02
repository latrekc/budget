export type ReducerState = {
  onlyUncomplited: boolean;
  sources: ReadonlyArray<string> | null;
};

export enum ReducerActionType {
  toggleOnlyUncomplited,
  setSources,
}

export type ReducerAction =
  | {
      type: ReducerActionType.toggleOnlyUncomplited;
    }
  | { type: ReducerActionType.setSources; payload: ReducerState["sources"] };

export const initialState: ReducerState = {
  onlyUncomplited: false,
  sources: null,
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
  }
}
