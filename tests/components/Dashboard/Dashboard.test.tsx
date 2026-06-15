import Dashboard from "@/components/Dashboard";
import { DashboardQuery } from "@/components/Dashboard/__generated__/DashboardQuery.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";
import { asFragment } from "../../utils/fragment";
const mockUsePreloadedQuery = jest.fn();
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  usePreloadedQuery: (q: unknown, p: unknown) => mockUsePreloadedQuery(q, p),
  useFragment: jest.fn(),
  useRefetchableFragment: jest.fn(),
  usePaginationFragment: jest.fn(),
  useLazyLoadQuery: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), false]),
}));
jest.mock("@/components/Dashboard/DashboardByTimePeriods", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return {
    __esModule: true,
    default: ({ statistic }: { statistic: unknown }) =>
      React.createElement(
        "div",
        {
          "data-testid": "dashboard-by-time-periods",
          "data-statistic": String(!!statistic),
        },
        "DashboardByTimePeriods",
      ),
  };
});
jest.mock("@/components/Filters", () => {
  const React = jest.requireActual("react") as typeof import("react");
  type Props = { categories?: boolean; months?: boolean };
  return {
    __esModule: true,
    default: ({ categories, months }: Props) =>
      React.createElement(
        "div",
        {
          "data-testid": "filters",
          "data-categories": String(!!categories),
          "data-months": String(!!months),
        },
        "Filters",
      ),
  };
});
describe("Dashboard", () => {
  const mockPreloadedQuery = asFragment<PreloadedQuery<DashboardQuery>>({});
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePreloadedQuery.mockReturnValue({});
  });
  it("renders flex row 3/4 DashboardByTimePeriods left 1/4 Filters right with categories months true and asserts layout structure count 2 children", () => {
    render(<Dashboard preloadedQuery={mockPreloadedQuery} />);
    const container = screen.getByText("DashboardByTimePeriods").parentElement
      ?.parentElement;
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("flex-row");
    const dashboardSection = screen.getByTestId("dashboard-by-time-periods");
    expect(dashboardSection).toBeInTheDocument();
    expect(dashboardSection.parentElement).toHaveClass("basis-3/4");
    expect(dashboardSection.parentElement).toHaveClass("py-3");
    const filtersSection = screen.getByTestId("filters");
    expect(filtersSection).toBeInTheDocument();
    expect(filtersSection.parentElement).toHaveClass("basis-1/4");
    expect(filtersSection.parentElement).toHaveClass("p-6");
    const flexContainer = dashboardSection.parentElement?.parentElement;
    const children = Array.from(flexContainer?.children || []);
    expect(children).toHaveLength(2);
  });
  it("passes preloadedQuery via usePreloadedQuery and renders DashboardByTimePeriods with statistic prop", () => {
    render(<Dashboard preloadedQuery={mockPreloadedQuery} />);
    expect(mockUsePreloadedQuery).toHaveBeenCalled();
    const callArgs = mockUsePreloadedQuery.mock.calls[0];
    expect(callArgs[1]).toBe(mockPreloadedQuery);
    const dashboardByTime = screen.getByTestId("dashboard-by-time-periods");
    expect(dashboardByTime).toHaveAttribute("data-statistic", "true");
  });
  it("renders Filters with categories true months true data prop and asserts Filters count 1", () => {
    render(<Dashboard preloadedQuery={mockPreloadedQuery} />);
    const filters = screen.getByTestId("filters");
    expect(filters).toHaveAttribute("data-categories", "true");
    expect(filters).toHaveAttribute("data-months", "true");
    expect(screen.getAllByTestId("filters")).toHaveLength(1);
  });
  it("renders DashboardByTimePeriods exactly once and asserts count 1", () => {
    render(<Dashboard preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getAllByTestId("dashboard-by-time-periods")).toHaveLength(1);
  });
  it("structure has flex row container and asserts 2 direct div children with correct basis classes", () => {
    const { container } = render(
      <Dashboard preloadedQuery={mockPreloadedQuery} />,
    );
    const flexDiv = container.querySelector("div.flex.flex-row");
    expect(flexDiv).toBeInTheDocument();
    const directChildren = flexDiv ? Array.from(flexDiv.children) : [];
    expect(directChildren).toHaveLength(2);
    expect(directChildren[0]).toHaveClass("basis-3/4");
    expect(directChildren[1]).toHaveClass("basis-1/4");
  });
});
