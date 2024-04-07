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
  addCategory,
  removeCategory,
  updateCategory,
  resetState,
}

export type SplitCategoryReducerAction =
  | {
      payload: { amount: number; id: CategoryID };
      type: SplitCategoryReducerActionType.addCategory;
    }
  | {
      payload: { id: CategoryID };
      type: SplitCategoryReducerActionType.removeCategory;
    }
  | {
      payload: SplitCategory;
      type: SplitCategoryReducerActionType.updateCategory;
    }
  | {
      payload: SplitCategoryState;
      type: SplitCategoryReducerActionType.resetState;
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
    case SplitCategoryReducerActionType.addCategory: {
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

    case SplitCategoryReducerActionType.removeCategory: {
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

    case SplitCategoryReducerActionType.updateCategory: {
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
          type: SplitCategoryReducerActionType.updateCategory,
        });
      }

      return {
        categories: newCategories,
        rest,
        total: state.total,
      };
    }

    case SplitCategoryReducerActionType.resetState:
      return action.payload;
  }
}
