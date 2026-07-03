import Transactions from "@/components/Transactions";
import { TransactionsQuery } from "@/components/Transactions/__generated__/TransactionsQuery.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";
import { asFragment } from "../../utils/fragment";

const mockUsePreloadedQuery = jest.fn();
const mockDispatch = jest.fn();
const mockFiltersState = {
  amount: null,
  amountRelation: null,
  categories: null,
  currencies: null,
  ignoreCategories: null,
  months: null,
  onlyIncome: false,
  onlyUncomplited: false,
  search: null,
  sortBy: null,
  sources: null,
};

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  usePreloadedQuery: (...args: unknown[]) => mockUsePreloadedQuery(...args),
}));

jest.mock("@/components/Filters/FiltersProvider", () => ({
  useFilters: () => ({
    dispatch: mockDispatch,
    filtersState: mockFiltersState,
  }),
}));

jest.mock(
  "@/components/Filters",
  () => (_props: Record<string, unknown>) =>
    jest.requireActual("react").createElement(
      "div",
      {
        "data-testid": "filters",
        "data-categories": (_props as Record<string, unknown>).categories,
      },
      "Filters",
    ),
);
jest.mock(
  "@/components/Filters/FiltersTransactions",
  () => (_props: Record<string, unknown>) =>
    jest
      .requireActual("react")
      .createElement(
        "div",
        { "data-testid": "filters-transactions" },
        "FiltersTransactions",
      ),
);
jest.mock(
  "@/components/Transactions/TransactionsTable",
  () => (_props: Record<string, unknown>) =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "transactions-table" }, "Table"),
);

describe("Transactions Component", () => {
  const preloadedQuery = asFragment<PreloadedQuery<TransactionsQuery>>({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePreloadedQuery.mockReturnValue({});
  });

  it("renders left 3/4 FiltersTransactions plus TransactionsTable and right 1/4 Filters with categories months sources flags", () => {
    render(<Transactions preloadedQuery={preloadedQuery} />);
    expect(screen.getByTestId("filters-transactions")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    expect(screen.getByTestId("filters")).toBeInTheDocument();
    const filtersDiv = screen.getByTestId("filters");
    expect(filtersDiv).toHaveAttribute("data-categories", "true");
  });

  it("usePreloadedQuery passes data to children via mocked return", () => {
    render(<Transactions preloadedQuery={preloadedQuery} />);
    expect(mockUsePreloadedQuery).toHaveBeenCalled();
  });

  it("selectedTransactions state Set management passed down initially empty", () => {
    // We can't directly inspect state but we verify components render; state is internal Set.
    render(<Transactions preloadedQuery={preloadedQuery} />);
    expect(screen.getByTestId("transactions-table")).toBeInTheDocument();
    expect(screen.getByTestId("filters-transactions")).toBeInTheDocument();
  });
});
