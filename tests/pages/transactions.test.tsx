import Page from "@/transactions/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";

import { PER_PAGE } from "@/components/Transactions/TransactionsTable";
import { TransactionsQuery } from "@/components/Transactions/__generated__/TransactionsQuery.graphql";

const mockUseQueryLoader = jest.fn();
const mockLoadQuery = jest.fn();
const mockUseDeferredValue = jest.fn((v) => v);
const mockUseFilters = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useQueryLoader: (...args: unknown[]) => mockUseQueryLoader(...args),
}));

jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useDeferredValue: (v: unknown) => mockUseDeferredValue(v),
    useEffect: (fn: () => void) => fn(),
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockTransactions = ({
      preloadedQuery,
    }: {
      preloadedQuery: unknown;
    }) => (
      <div data-testid="transactions-component">
        Transactions preloaded {preloadedQuery ? "yes" : "no"}
      </div>
    );
    return MockTransactions;
  },
}));

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: ({ active }: { active: unknown }) => (
    <div data-testid="header">Header active {String(active)}</div>
  ),
  PageType: { Transactions: "Transactions" },
}));

jest.mock("@/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading</div>,
}));

jest.mock("@/components/Transactions", () => ({
  TransactionsQuery: {},
}));

jest.mock("@/components/Transactions/TransactionsTable", () => ({
  PER_PAGE: 20,
}));

jest.mock("@/components/Filters/FiltersProvider", () => ({
  useFilters: () => mockUseFilters(),
}));

describe("Transactions Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeferredValue.mockImplementation((v) => v);
    mockUseFilters.mockReturnValue({
      categoryFiltersState: null,
      filtersState: null,
    });
  });

  it("renders Loading when preloadedQuery is null", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(
      screen.queryByTestId("transactions-component"),
    ).not.toBeInTheDocument();
  });

  it("renders Transactions component with Suspense fallback when loaded", () => {
    const mockPreloaded = {} as PreloadedQuery<TransactionsQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("transactions-component")).toBeInTheDocument();
    expect(screen.getByText("Transactions preloaded yes")).toBeInTheDocument();
  });

  it("calls loadQuery with first PER_PAGE filters null by default", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);
    mockUseFilters.mockReturnValue({
      categoryFiltersState: null,
      filtersState: null,
    });

    render(<Page />);

    expect(mockLoadQuery).toHaveBeenCalledTimes(1);
    expect(mockLoadQuery).toHaveBeenCalledWith(
      {
        categoryFilters: null,
        filters: null,
        first: PER_PAGE,
      },
      { fetchPolicy: "store-and-network" },
    );
    expect(PER_PAGE).toBe(20);
  });

  it("passes filters from useFilters to loadQuery", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);
    const categoryFilters = { categories: ["c1"] };
    const filters = { search: "test" };
    mockUseFilters.mockReturnValue({
      categoryFiltersState: categoryFilters,
      filtersState: filters,
    });

    render(<Page />);

    expect(mockLoadQuery).toHaveBeenCalledWith(
      {
        categoryFilters,
        filters,
        first: 20,
      },
      { fetchPolicy: "store-and-network" },
    );
  });

  it("renders Header with active PageType Transactions", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toHaveTextContent(
      "Header active Transactions",
    );
  });

  it("applies opacity-50 when deferred differs", () => {
    const mockPreloaded = {
      id: 1,
    } as unknown as PreloadedQuery<TransactionsQuery>;
    const mockDeferred = {
      id: 2,
    } as unknown as PreloadedQuery<TransactionsQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);
    let callCount = 0;
    mockUseDeferredValue.mockImplementation((v) => {
      callCount += 1;
      return callCount === 1 ? mockDeferred : v;
    });

    const { container } = render(<Page />);

    expect(container.querySelector(".opacity-50")).toBeInTheDocument();
  });
});
