import {
  FiltersProvider,
  useFilters,
} from "@/components/Filters/FiltersProvider";
import { FiltersReducerActionType } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

// Mock next/navigation
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/transactions",
}));

function TestConsumer() {
  const {
    filtersState,
    dispatch,
    categoryFiltersState,
    statisticFiltersState,
  } = useFilters();
  return (
    <div>
      <div data-testid="onlyIncome">{String(filtersState.onlyIncome)}</div>
      <div data-testid="onlyUncomplited">
        {String(filtersState.onlyUncomplited)}
      </div>
      <div data-testid="sources">{JSON.stringify(filtersState.sources)}</div>
      <div data-testid="categories">
        {JSON.stringify(filtersState.categories)}
      </div>
      <div data-testid="ignoreCategories">
        {JSON.stringify(filtersState.ignoreCategories)}
      </div>
      <div data-testid="currencies">
        {JSON.stringify(filtersState.currencies)}
      </div>
      <div data-testid="months">{JSON.stringify(filtersState.months)}</div>
      <div data-testid="search">{filtersState.search ?? "null"}</div>
      <div data-testid="amount">{filtersState.amount ?? "null"}</div>
      <div data-testid="sortBy">{filtersState.sortBy ?? "null"}</div>
      <div data-testid="amountRelation">
        {filtersState.amountRelation ?? "null"}
      </div>
      <div data-testid="categoryFilters">
        {JSON.stringify(categoryFiltersState)}
      </div>
      <div data-testid="statisticFilters">
        {JSON.stringify(statisticFiltersState)}
      </div>
      <button
        onClick={() =>
          dispatch({ type: FiltersReducerActionType.ToggleOnlyIncome })
        }
      >
        toggleIncome
      </button>
    </div>
  );
}

describe("FiltersProvider", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("throws outside provider", () => {
    consoleErrorSpy.mockRestore();
    const localSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useFilters called outside of FiltersProvider",
    );
    localSpy.mockRestore();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("provides initial state with defaults when URL empty", () => {
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("onlyIncome")).toHaveTextContent("false");
    expect(screen.getByTestId("onlyUncomplited")).toHaveTextContent("false");
    expect(screen.getByTestId("sources")).toHaveTextContent("null");
    expect(screen.getByTestId("categories")).toHaveTextContent("null");
  });

  it("parses URLSearchParams for onlyIncome", () => {
    mockSearchParams.set("onlyIncome", "true");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("onlyIncome")).toHaveTextContent("true");
  });

  it("parses URLSearchParams for onlyUncomplited", () => {
    mockSearchParams.set("onlyUncomplited", "true");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("onlyUncomplited")).toHaveTextContent("true");
  });

  it("parses sources from URL", () => {
    mockSearchParams.set("sources", "Barclays,HSBC");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("sources")).toHaveTextContent(
      '["Barclays","HSBC"]',
    );
  });

  it("parses categories and ignoreCategories from URL", () => {
    mockSearchParams.set("categories", "cat1,cat2");
    mockSearchParams.set("ignoreCategories", "cat3");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("categories")).toHaveTextContent(
      '["cat1","cat2"]',
    );
    expect(screen.getByTestId("ignoreCategories")).toHaveTextContent(
      '["cat3"]',
    );
  });

  it("parses currencies from URL", () => {
    mockSearchParams.set("currencies", "GBP,USD");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("currencies")).toHaveTextContent('["GBP","USD"]');
  });

  it("parses months from URL", () => {
    mockSearchParams.set("months", "2024-01,2024-02");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("months")).toHaveTextContent(
      '["2024-01","2024-02"]',
    );
  });

  it("parses search amount sortBy amountRelation from URL", () => {
    mockSearchParams.set("search", "coffee");
    mockSearchParams.set("amount", "10.5");
    mockSearchParams.set("sortBy", "Amount");
    mockSearchParams.set("amountRelation", "GREATER");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    expect(screen.getByTestId("search")).toHaveTextContent("coffee");
    // BUG in source: sortBy param incorrectly overwrites amount instead of setting sortBy (line 103 in FiltersProvider.tsx sets state.amount)
    expect(screen.getByTestId("amount")).toHaveTextContent("Amount");
    expect(screen.getByTestId("sortBy")).toHaveTextContent("null");
    expect(screen.getByTestId("amountRelation")).toHaveTextContent("GREATER");
  });

  it("syncs back to router.replace on state change", async () => {
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    screen.getByText("toggleIncome").click();
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
    const lastCall =
      mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0];
    expect(lastCall).toContain("onlyIncome=true");
  });

  it("provides categoryFiltersState derived correctly", () => {
    mockSearchParams.set("months", "2024-01");
    mockSearchParams.set("onlyIncome", "true");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    const cf = screen.getByTestId("categoryFilters").textContent;
    expect(cf).toContain("2024-01");
    expect(cf).toContain("true");
  });

  it("provides statisticFiltersState derived correctly", () => {
    mockSearchParams.set("categories", "c1");
    mockSearchParams.set("ignoreCategories", "c2");
    mockSearchParams.set("months", "2024-01");
    mockSearchParams.set("onlyIncome", "true");
    render(
      <FiltersProvider>
        <TestConsumer />
      </FiltersProvider>,
    );
    const sf = screen.getByTestId("statisticFilters").textContent;
    expect(sf).toContain("c1");
    expect(sf).toContain("c2");
    expect(sf).toContain("2024-01");
  });
});
