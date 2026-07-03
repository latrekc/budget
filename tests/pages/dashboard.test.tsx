import Page from "@/dashboard/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";

import { DashboardQuery } from "@/components/Dashboard/__generated__/DashboardQuery.graphql";

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
    const MockDashboard = ({ preloadedQuery }: { preloadedQuery: unknown }) => (
      <div data-testid="dashboard-component">
        Dashboard preloaded {preloadedQuery ? "yes" : "no"}
      </div>
    );
    return MockDashboard;
  },
}));

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: ({ active }: { active: unknown }) => (
    <div data-testid="header">Header active {String(active)}</div>
  ),
  PageType: { Dashboard: "Dashboard" },
}));

jest.mock("@/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading</div>,
}));

jest.mock("@/components/Dashboard", () => ({
  DashboardQuery: {},
}));

jest.mock("@/components/Filters/FiltersProvider", () => ({
  useFilters: () => mockUseFilters(),
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeferredValue.mockImplementation((v) => v);
    mockUseFilters.mockReturnValue({
      categoryFiltersState: null,
      statisticFiltersState: null,
    });
  });

  it("renders Loading when preloadedQuery is null", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-component")).not.toBeInTheDocument();
  });

  it("renders Dashboard component with Suspense fallback when loaded", () => {
    const mockPreloaded = {} as PreloadedQuery<DashboardQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
    expect(screen.getByText("Dashboard preloaded yes")).toBeInTheDocument();
  });

  it("calls loadQuery with statisticFilters and categoryFilters null by default", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);
    mockUseFilters.mockReturnValue({
      categoryFiltersState: null,
      statisticFiltersState: null,
    });

    render(<Page />);

    expect(mockLoadQuery).toHaveBeenCalledTimes(1);
    expect(mockLoadQuery).toHaveBeenCalledWith(
      {
        categoryFilters: null,
        statisticFilters: null,
      },
      { fetchPolicy: "store-and-network" },
    );
  });

  it("passes filters from useFilters context to loadQuery", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);
    const categoryFilters = { categories: ["cat1"] };
    const statisticFilters = { months: ["2024-01"] };
    mockUseFilters.mockReturnValue({
      categoryFiltersState: categoryFilters,
      statisticFiltersState: statisticFilters,
    });

    render(<Page />);

    expect(mockLoadQuery).toHaveBeenCalledWith(
      {
        categoryFilters,
        statisticFilters,
      },
      { fetchPolicy: "store-and-network" },
    );
  });

  it("renders Header with active PageType Dashboard", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toHaveTextContent(
      "Header active Dashboard",
    );
  });

  it("applies opacity-50 when deferred differs", () => {
    const mockPreloaded = {
      id: 1,
    } as unknown as PreloadedQuery<DashboardQuery>;
    const mockDeferred = { id: 2 } as unknown as PreloadedQuery<DashboardQuery>;
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
