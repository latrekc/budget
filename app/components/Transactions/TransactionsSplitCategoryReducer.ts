type CategoryID = string;

type SplitCategory = {
  amounts: number[];
  id: CategoryID;
};

export type SplitCategoryState = {
  categories: Array<SplitCategory>;
  rest: number;
  total: number;
};

export enum SplitCategoryReducerActionType {
  AddCategory,
  RemoveCategory,
  UpdateCategory,
  ResetState,
}

export type SplitCategoryReducerAction =
  | {
      payload: { amounts: number[]; id: CategoryID };
      type: SplitCategoryReducerActionType.AddCategory;
    }
  | {
      payload: { id: CategoryID };
      type: SplitCategoryReducerActionType.RemoveCategory;
    }
  | {
      payload: SplitCategory;
      type: SplitCategoryReducerActionType.UpdateCategory;
    }
  | {
      payload: SplitCategoryState;
      type: SplitCategoryReducerActionType.ResetState;
    };

export default function SplitCategoryReducer(
  state: SplitCategoryState,
  action: SplitCategoryReducerAction,
): SplitCategoryState {
  function countRest(newCategories: Array<SplitCategory>) {
    const newCategoriesTotal = newCategories.reduce((sum, category) => {
      return (
        sum +
        Math.abs(
          category.amounts.reduce(
            (sum, amount) => sum + (isNaN(amount) ? 0 : amount),
            0,
          ),
        )
      );
    }, 0);

    return state.total - newCategoriesTotal;
  }

  switch (action.type) {
    case SplitCategoryReducerActionType.AddCategory: {
      if (state.categories.some(({ id }) => id === action.payload.id)) {
        return state;
      }

      const newCategories = [
        ...state.categories,
        {
          amounts: action.payload.amounts,
          id: action.payload.id,
        },
      ];

      const rest = countRest(newCategories);

      return {
        ...state,
        categories: newCategories,
        rest,
      };
    }

    case SplitCategoryReducerActionType.RemoveCategory: {
      const newCategories = state.categories.filter(
        ({ id }) => id !== action.payload.id,
      );

      const rest = countRest(newCategories);

      return {
        ...state,
        categories: newCategories,
        rest,
      };
    }

    case SplitCategoryReducerActionType.UpdateCategory: {
      const newCategories: SplitCategory[] = state.categories.map(
        (category) => {
          if (category.id! !== action.payload.id) {
            return category;
          }
          return {
            amounts: action.payload.amounts,
            id: category.id,
          };
        },
      );

      const rest = countRest(newCategories);

      if (rest < 0) {
        return SplitCategoryReducer(state, {
          payload: {
            amounts: [
              action.payload.amounts.reduce((sum, amount) => sum + amount, 0) +
                rest,
            ],
            id: action.payload.id,
          },
          type: SplitCategoryReducerActionType.UpdateCategory,
        });
      }

      return {
        categories: newCategories,
        rest,
        total: state.total,
      };
    }

    case SplitCategoryReducerActionType.ResetState:
      return action.payload;
  }
}
