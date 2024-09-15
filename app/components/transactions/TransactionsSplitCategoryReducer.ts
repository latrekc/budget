type CategoryID = string;

type SplitCategory = {
  amount: number;
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
      payload: { amount: number; id: CategoryID };
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
      return (sum * 100 + Math.abs(category.amount) * 100) / 100;
    }, 0);

    return (state.total * 100 - newCategoriesTotal * 100) / 100;
  }

  switch (action.type) {
    case SplitCategoryReducerActionType.AddCategory: {
      if (state.categories.some(({ id }) => id === action.payload.id)) {
        return state;
      }

      const newCategories = [
        ...state.categories,
        {
          amount: action.payload.amount,
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
            amount: action.payload.amount,
            id: category.id,
          };
        },
      );

      const rest = countRest(newCategories);

      if (rest < 0) {
        return SplitCategoryReducer(state, {
          payload: {
            amount: (action.payload.amount * 100 + rest * 100) / 100,
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
