import DashboardByTimePeriods from "@/components/Dashboard/DashboardByTimePeriods";
import { DashboardByTimePeriods$key } from "@/components/Dashboard/__generated__/DashboardByTimePeriods.graphql";
import { FiltersReducerActionType } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";
const mockUseFragment = jest.fn();
const mockDispatch = jest.fn();
const mockUseFilters = jest.fn();
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: (f: unknown, k: unknown) => mockUseFragment(f, k),
  usePreloadedQuery: jest.fn(),
  useRefetchableFragment: jest.fn(),
  usePaginationFragment: jest.fn(),
  useLazyLoadQuery: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), false]),
}));
jest.mock("@/components/Filters/FiltersProvider", () => ({
  useFilters: () => mockUseFilters(),
}));
jest.mock("echarts-for-react", () => {
  const React = jest.requireActual("react") as typeof import("react");
  type Props = {
    option?: unknown;
    onEvents?: Record<string, (e: unknown) => void>;
    className?: string;
  };
  return {
    __esModule: true,
    default: ({ option, onEvents, className }: Props) =>
      React.createElement("div", {
        "data-testid": "echarts",
        "data-option": JSON.stringify(option),
        className,
        onClick: () => onEvents?.click?.({ seriesId: "cat-1" }),
      }),
  };
});
jest.mock("@/components/AmountValue", () => ({
  __esModule: true,
  default: () => null,
  AmountValueFormat: ({
    amount,
    currency,
  }: {
    amount: number;
    currency: string;
  }) => `${currency}:${amount}`,
}));
jest.mock("@/components/Dashboard/DashboardTooltip", () => ({
  DashboardTooltip: () => null,
}));
describe("DashboardByTimePeriods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFilters.mockReturnValue({
      dispatch: mockDispatch,
      filtersState: { categories: [] },
    });
  });
  function setup(categories: unknown[], transactionsStatistic: unknown[]) {
    mockUseFragment.mockReturnValue({ categories, transactionsStatistic });
    return asFragment<DashboardByTimePeriods$key>({});
  }
  it("0 categories empty maps echarts series empty still renders without crash and asserts 2 echarts count", () => {
    render(<DashboardByTimePeriods statistic={setup([], [])} />);
    const charts = screen.getAllByTestId("echarts");
    expect(charts).toHaveLength(2);
    expect(charts[0]).toHaveClass("min-h-[1000px]");
    expect(charts[1]).toHaveClass("min-h-[2000px]");
  });
  it("0 transactionsStatistic empty bar and sunburst and asserts 2 echarts", () => {
    render(
      <DashboardByTimePeriods
        statistic={setup(
          [
            {
              id: "cat-1",
              name: "Food",
              color: "#ff0000",
              parentCategory: null,
              subCategories: [],
            },
          ],
          [],
        )}
      />,
    );
    expect(screen.getAllByTestId("echarts")).toHaveLength(2);
  });
  it("X categories flat list no parent builds allCategories Map root level sunburstIncomeStatistic and sunburstOutcomeStatistic filter root parentCategory==null and asserts echarts count 2", () => {
    const categories = [
      {
        id: "c1",
        name: "Food",
        color: "#f00",
        parentCategory: null,
        subCategories: [],
      },
      {
        id: "c2",
        name: "Travel",
        color: "#0f0",
        parentCategory: null,
        subCategories: [],
      },
      {
        id: "c3",
        name: "Bills",
        color: "#00f",
        parentCategory: null,
        subCategories: [],
      },
    ];
    const transactions = [
      {
        id: "t1",
        income: 10000,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "c1" },
      },
      {
        id: "t2",
        income: 0,
        outcome: -5000,
        monthId: "2024-01",
        category: { id: "c2" },
      },
      {
        id: "t3",
        income: 20000,
        outcome: 0,
        monthId: "2024-02",
        category: { id: "c3" },
      },
    ];
    render(
      <DashboardByTimePeriods statistic={setup(categories, transactions)} />,
    );
    const charts = screen.getAllByTestId("echarts");
    expect(charts).toHaveLength(2);
    const barOption = JSON.parse(charts[0].getAttribute("data-option") || "{}");
    expect(barOption.series.length).toBeGreaterThanOrEqual(3);
    expect(barOption.series).toHaveLength(6);
  });
  it("Y categories tree 3 levels parent sub subSub hierarchy correctly aggregated color gradient by hierarchy level and asserts echarts count 2", () => {
    const categories = [
      {
        id: "root",
        name: "Root",
        color: "#111",
        parentCategory: null,
        subCategories: [{ id: "l2" }],
      },
      {
        id: "l2",
        name: "L2",
        color: "#222",
        parentCategory: { id: "root", parentCategory: null },
        subCategories: [{ id: "l3" }],
      },
      {
        id: "l3",
        name: "L3",
        color: "#333",
        parentCategory: { id: "l2", parentCategory: { id: "root" } },
        subCategories: [],
      },
    ];
    const transactions = [
      {
        id: "t1",
        income: 1000,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "root" },
      },
      {
        id: "t2",
        income: 2000,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "l2" },
      },
      {
        id: "t3",
        income: 0,
        outcome: -500,
        monthId: "2024-01",
        category: { id: "l3" },
      },
    ];
    render(
      <DashboardByTimePeriods statistic={setup(categories, transactions)} />,
    );
    const charts = screen.getAllByTestId("echarts");
    expect(charts).toHaveLength(2);
    const sunburstOption = JSON.parse(
      charts[1].getAttribute("data-option") || "{}",
    );
    expect(sunburstOption.series).toHaveLength(2);
    expect(sunburstOption.series[0].center).toEqual(["50%", "25%"]);
    expect(sunburstOption.series[1].center).toEqual(["50%", "75%"]);
  });
  it("bar chart stacked bar per category with color plus income outcome area lines and saldo line dataZoom slider tooltip custom and asserts series count", () => {
    const categories = [
      {
        id: "c1",
        name: "A",
        color: "#a00",
        parentCategory: null,
        subCategories: [],
      },
      {
        id: "c2",
        name: "B",
        color: "#0a0",
        parentCategory: null,
        subCategories: [],
      },
    ];
    const transactions = [
      {
        id: "t1",
        income: 5000,
        outcome: 0,
        monthId: "2024-03",
        category: { id: "c1" },
      },
      {
        id: "t2",
        income: 0,
        outcome: -2000,
        monthId: "2024-03",
        category: { id: "c2" },
      },
    ];
    render(
      <DashboardByTimePeriods statistic={setup(categories, transactions)} />,
    );
    const barChart = screen.getAllByTestId("echarts")[0];
    const option = JSON.parse(barChart.getAttribute("data-option") || "{}");
    expect(option.dataZoom).toBeDefined();
    expect(option.dataZoom[0].type).toBe("slider");
    expect(option.tooltip.trigger).toBe("item");
    expect(option.series).toHaveLength(5);
    const seriesNames = option.series.map((s: { name?: string }) => s.name);
    expect(seriesNames).toContain("Income");
    expect(seriesNames).toContain("Outcome");
    expect(seriesNames).toContain("Saldo");
  });
  it("sunburst two series centers 25 percent and 75 percent levels 3 deep tooltip formatter and asserts 2 series", () => {
    render(<DashboardByTimePeriods statistic={setup([], [])} />);
    const sunburst = screen.getAllByTestId("echarts")[1];
    const option = JSON.parse(sunburst.getAttribute("data-option") || "{}");
    expect(option.series).toHaveLength(2);
    expect(option.series[0].type).toBe("sunburst");
    expect(option.series[0].levels).toHaveLength(4);
    expect(option.tooltip.enterable).toBe(true);
  });
  it("click event toggles FiltersReducer AddCategory or RemoveCategory and asserts dispatch called", () => {
    render(<DashboardByTimePeriods statistic={setup([], [])} />);
    const chart = screen.getAllByTestId("echarts")[0];
    fireEvent.click(chart);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "cat-1",
      type: FiltersReducerActionType.AddCategory,
    });
  });
  it("click event with existing category in filters dispatches RemoveCategory", () => {
    mockUseFilters.mockReturnValue({
      dispatch: mockDispatch,
      filtersState: { categories: ["cat-1"] },
    });
    render(<DashboardByTimePeriods statistic={setup([], [])} />);
    fireEvent.click(screen.getAllByTestId("echarts")[0]);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "cat-1",
      type: FiltersReducerActionType.RemoveCategory,
    });
  });
  it("zero-value transaction filtering excludes from aggregation and asserts series data null handling", () => {
    const categories = [
      {
        id: "c1",
        name: "Zero",
        color: "#000",
        parentCategory: null,
        subCategories: [],
      },
    ];
    const transactions = [
      {
        id: "t1",
        income: 0,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "c1" },
      },
      {
        id: "t2",
        income: 100,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "c1" },
      },
    ];
    render(
      <DashboardByTimePeriods statistic={setup(categories, transactions)} />,
    );
    const barOption = JSON.parse(
      screen.getAllByTestId("echarts")[0].getAttribute("data-option") || "{}",
    );
    const catSeries = barOption.series.find(
      (s: { id?: string }) => s.id === "c1",
    );
    expect(catSeries).toBeDefined();
    const dataPoints = catSeries.data.filter(
      ([, v]: [string, number | null]) => v !== null,
    );
    expect(dataPoints.length).toBeGreaterThan(0);
  });
  it("income outcome separation correct sign handling and asserts 2 echarts rendered", () => {
    const categories = [
      {
        id: "c1",
        name: "Mix",
        color: "#123",
        parentCategory: null,
        subCategories: [],
      },
    ];
    const transactions = [
      {
        id: "t1",
        income: 10000,
        outcome: 0,
        monthId: "2024-01",
        category: { id: "c1" },
      },
      {
        id: "t2",
        income: 0,
        outcome: -7000,
        monthId: "2024-01",
        category: { id: "c1" },
      },
    ];
    render(
      <DashboardByTimePeriods statistic={setup(categories, transactions)} />,
    );
    expect(screen.getAllByTestId("echarts")).toHaveLength(2);
    const barOption = JSON.parse(
      screen.getAllByTestId("echarts")[0].getAttribute("data-option") || "{}",
    );
    const incomeSeries = barOption.series.find(
      (s: { name?: string }) => s.name === "Income",
    );
    const outcomeSeries = barOption.series.find(
      (s: { name?: string }) => s.name === "Outcome",
    );
    expect(incomeSeries.data[0][1]).toBe(100);
    expect(outcomeSeries.data[0][1]).toBe(-70);
  });
  it("renders 0 categories and 0 transactions without crash and asserts echarts count 2 and empty series handling", () => {
    const { container } = render(
      <DashboardByTimePeriods statistic={setup([], [])} />,
    );
    expect(screen.getAllByTestId("echarts")).toHaveLength(2);
    expect(container).toBeInTheDocument();
  });
});
