import FiltersReducer, {
  FiltersReducerActionType,
  initialState,
} from "@/components/Filters/FiltersReducer";
import { AmountRelation, Currency, SortBy } from "@/lib/types";

describe("FiltersReducer", () => {
  it("toggles onlyIncome from false to true", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.ToggleOnlyIncome,
    });
    expect(next.onlyIncome).toBe(true);
  });

  it("toggles onlyIncome from true to false", () => {
    const state = { ...initialState, onlyIncome: true };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.ToggleOnlyIncome,
    });
    expect(next.onlyIncome).toBe(false);
  });

  it("toggles onlyUncomplited", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.ToggleOnlyUncomplited,
    });
    expect(next.onlyUncomplited).toBe(true);
  });

  it("sets amount to string value", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetAmount,
      payload: "123.45",
    });
    expect(next.amount).toBe("123.45");
  });

  it("sets amount to null", () => {
    const state = { ...initialState, amount: "10" };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.SetAmount,
      payload: null,
    });
    expect(next.amount).toBeNull();
  });

  it("sets amountRelation to GREATER", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetAmountRelation,
      payload: AmountRelation.GREATER,
    });
    expect(next.amountRelation).toBe(AmountRelation.GREATER);
  });

  it("nullifies amountRelation when EQUAL", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetAmountRelation,
      payload: AmountRelation.EQUAL,
    });
    expect(next.amountRelation).toBeNull();
  });

  it("sets sources array", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetSources,
      payload: ["Barclays", "HSBC"],
    });
    expect(next.sources).toHaveLength(2);
    expect(next.sources).toEqual(["Barclays", "HSBC"]);
  });

  it("sets sources to null when empty array", () => {
    const state = { ...initialState, sources: ["Barclays"] };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.SetSources,
      payload: null,
    });
    expect(next.sources).toBeNull();
  });

  it("sets months array", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetMonths,
      payload: ["2024-01", "2024-02"],
    });
    expect(next.months).toHaveLength(2);
  });

  it("sets search string", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetSearch,
      payload: "coffee",
    });
    expect(next.search).toBe("coffee");
  });

  it("sets categories to null when empty array via SetCategories", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetCategories,
      payload: null,
    });
    expect(next.categories).toBeNull();
  });

  it("sets categories array", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetCategories,
      payload: ["cat1", "cat2", "cat3"],
    });
    expect(next.categories).toHaveLength(3);
  });

  it("sets ignoreCategories array", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.SetIgnoreCategories,
      payload: ["cat1"],
    });
    expect(next.ignoreCategories).toEqual(["cat1"]);
  });

  it("adds category when undefined", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.AddCategory,
      payload: "new-cat",
    });
    expect(next.categories).toEqual(["new-cat"]);
  });

  it("adds category deduplicates existing", () => {
    const state = { ...initialState, categories: ["cat1"] };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.AddCategory,
      payload: "cat1",
    });
    expect(next.categories).toHaveLength(1);
    expect(next.categories).toEqual(["cat1"]);
  });

  it("adds second category to existing list", () => {
    const state = { ...initialState, categories: ["cat1"] };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.AddCategory,
      payload: "cat2",
    });
    expect(next.categories).toHaveLength(2);
    expect(next.categories).toContain("cat2");
  });

  it("removes category correctly", () => {
    const state = { ...initialState, categories: ["cat1", "cat2", "cat3"] };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.RemoveCategory,
      payload: "cat2",
    });
    expect(next.categories).toHaveLength(2);
    expect(next.categories).not.toContain("cat2");
  });

  it("remove non-existent category leaves unchanged", () => {
    const state = { ...initialState, categories: ["cat1"] };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.RemoveCategory,
      payload: "missing",
    });
    expect(next.categories).toEqual(["cat1"]);
  });

  it("toggles sortBy from null to Amount", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.ToggleSortBy,
    });
    expect(next.sortBy).toBe(SortBy.Amount);
  });

  it("toggles sortBy from Amount to null", () => {
    const state = { ...initialState, sortBy: SortBy.Amount };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.ToggleSortBy,
    });
    expect(next.sortBy).toBeNull();
  });

  it("toggles currency adds when null defaults to all then removes one", () => {
    const next = FiltersReducer(initialState, {
      type: FiltersReducerActionType.ToggleCurrency,
      payload: Currency.GBP,
    });
    expect(next.currencies).not.toBeNull();
    expect(next.currencies).not.toContain(Currency.GBP);
    expect(next.currencies?.length).toBe(Object.values(Currency).length - 1);
  });

  it("toggles currency removes all to null when toggling last remaining", () => {
    const state = {
      ...initialState,
      currencies: [Currency.GBP] as readonly Currency[],
    };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.ToggleCurrency,
      payload: Currency.GBP,
    });
    expect(next.currencies).toBeNull();
  });

  it("toggles currency adds back to reach all then nullifies", () => {
    const allButOne = Object.values(Currency).filter((c) => c !== Currency.USD);
    const state = {
      ...initialState,
      currencies: allButOne as readonly Currency[],
    };
    const next = FiltersReducer(state, {
      type: FiltersReducerActionType.ToggleCurrency,
      payload: Currency.USD,
    });
    expect(next.currencies).toBeNull();
  });
});
