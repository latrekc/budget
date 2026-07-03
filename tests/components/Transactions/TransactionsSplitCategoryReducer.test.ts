import SplitCategoryReducer, {
  SplitCategoryReducerActionType,
  SplitCategoryState,
} from "@/components/Transactions/TransactionsSplitCategoryReducer";

describe("TransactionsSplitCategoryReducer", () => {
  const baseState: SplitCategoryState = {
    categories: [],
    rest: 1000,
    total: 1000,
  };

  it("countRest calculates total minus sum abs amounts ignoring NaN", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [300, NaN], id: "c1" }],
      rest: 0,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { amounts: [200], id: "c2" },
      type: SplitCategoryReducerActionType.AddCategory,
    });
    expect(result.rest).toBe(500);
    expect(result.categories).toHaveLength(2);
  });

  it("Add ignores duplicate id and returns same state reference", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [400], id: "c1" }],
      rest: 600,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { amounts: [100], id: "c1" },
      type: SplitCategoryReducerActionType.AddCategory,
    });
    expect(result).toBe(state);
    expect(result.categories).toHaveLength(1);
  });

  it("Add new category appends and recalculates rest", () => {
    const result = SplitCategoryReducer(baseState, {
      payload: { amounts: [250], id: "c1" },
      type: SplitCategoryReducerActionType.AddCategory,
    });
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toEqual({ amounts: [250], id: "c1" });
    expect(result.rest).toBe(750);
  });

  it("Remove filters out category and recalculates rest", () => {
    const state: SplitCategoryState = {
      categories: [
        { amounts: [300], id: "c1" },
        { amounts: [200], id: "c2" },
      ],
      rest: 500,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { id: "c1" },
      type: SplitCategoryReducerActionType.RemoveCategory,
    });
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].id).toBe("c2");
    expect(result.rest).toBe(800);
  });

  it("Update maps category amounts and recalculates rest", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [300], id: "c1" }],
      rest: 700,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { amounts: [400], id: "c1" },
      type: SplitCategoryReducerActionType.UpdateCategory,
    });
    expect(result.categories[0].amounts).toEqual([400]);
    expect(result.rest).toBe(600);
  });

  it("Update with rest negative recursively reduces current amounts to prevent over-allocation", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [300], id: "c1" }],
      rest: 700,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { amounts: [1200], id: "c1" },
      type: SplitCategoryReducerActionType.UpdateCategory,
    });
    expect(result.rest).toBe(0);
    expect(result.categories[0].amounts).toEqual([1000]);
  });

  it("Update with multiple amounts sums absolute values correctly", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [100, 200], id: "c1" }],
      rest: 700,
      total: 1000,
    };
    const result = SplitCategoryReducer(state, {
      payload: { amounts: [150, 250], id: "c1" },
      type: SplitCategoryReducerActionType.UpdateCategory,
    });
    expect(result.rest).toBe(600);
  });

  it("Reset replaces state with initial payload", () => {
    const state: SplitCategoryState = {
      categories: [{ amounts: [500], id: "c1" }],
      rest: 500,
      total: 1000,
    };
    const newState: SplitCategoryState = {
      categories: [],
      rest: 2000,
      total: 2000,
    };
    const result = SplitCategoryReducer(state, {
      payload: newState,
      type: SplitCategoryReducerActionType.ResetState,
    });
    expect(result).toEqual(newState);
  });
});
