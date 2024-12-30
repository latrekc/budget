type CategoryID = string;

type SplitCategory = {
  id: CategoryID;
  quantities: number[];
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
      payload: { id: CategoryID };
      type: SplitCategoryReducerActionType.RemoveCategory;
    }
  | {
      payload: { id: CategoryID; quantities: number[] };
      type: SplitCategoryReducerActionType.AddCategory;
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
          category.quantities.reduce(
            (sum, quantity) => sum + (isNaN(quantity) ? 0 : quantity),
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
          id: action.payload.id,
          quantities: action.payload.quantities,
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
            id: category.id,
            quantities: action.payload.quantities,
          };
        },
      );

      const rest = countRest(newCategories);

      if (rest < 0) {
        return SplitCategoryReducer(state, {
          payload: {
            id: action.payload.id,
            quantities: [
              action.payload.quantities.reduce(
                (sum, quantity) => sum + quantity,
                0,
              ) + rest,
            ],
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
