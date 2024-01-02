export type ReducerState = {
  onlyUncomplited: boolean;
  sources: ReadonlyArray<string> | null;
  month: string | null;
};

export enum ReducerActionType {
  toggleOnlyUncomplited,
  setSources,
  setMonth,
}

export type ReducerAction =
  | {
      type: ReducerActionType.toggleOnlyUncomplited;
    }
  | { type: ReducerActionType.setSources; payload: ReducerState["sources"] }
  | { type: ReducerActionType.setMonth; payload: ReducerState["month"] };

export const initialState: ReducerState = {
  onlyUncomplited: false,
  sources: null,
  month: null,
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
  }
}
