import Filters from "@/components/Filters";
import { Filters$key } from "@/components/Filters/__generated__/Filters.graphql";
import { initialState } from "@/components/Filters/FiltersReducer";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, key) => key),
  useRefetchableFragment: jest.fn(() => [{ categories: [] }, jest.fn()]),
  usePaginationFragment: jest.fn(() => ({
    data: {
      transactionsStatisticPerMonths: [],
      transactionsStatisticPerSource: [],
    },
    loadNext: jest.fn(),
    hasNext: false,
    isLoadingNext: false,
  })),
  usePreloadedQuery: jest.fn(),
  useLazyLoadQuery: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), false]),
}));

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    unsubscribe: jest.fn(),
  }),
}));

jest.mock("@/components/Filters/FiltersProvider", () => ({
  useFilters: jest.fn(() => ({
    dispatch: jest.fn(),
    filtersState: jest.requireActual("@/components/Filters/FiltersReducer")
      .initialState,
  })),
}));

jest.mock(
  "@/components/Filters/FiltersCategories",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "filters-categories",
    }),
);
jest.mock(
  "@/components/Filters/FiltersMonths",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "filters-months" }),
);
jest.mock(
  "@/components/Filters/FiltersSources",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "filters-sources" }),
);

describe("Filters", () => {
  const mockData = asFragment<Filters$key>({});

  it("renders accordion with 3 items hidden based on props false and asserts count 0 visible", () => {
    render(
      <Filters
        data={mockData}
        categories={false}
        months={false}
        sources={false}
      />,
    );
    const items = screen.queryAllByTestId("accordion-item");
    expect(items).toHaveLength(0);
  });

  it("renders 1 accordion item when categories true and asserts count 1", () => {
    render(
      <Filters
        data={mockData}
        categories={true}
        months={false}
        sources={false}
      />,
    );
    const items = screen.getAllByTestId("accordion-item");
    expect(items).toHaveLength(1);
    expect(screen.getByTestId("filters-categories")).toBeInTheDocument();
  });

  it("renders 3 accordion items when all true and asserts count 3", () => {
    render(
      <Filters
        data={mockData}
        categories={true}
        months={true}
        sources={true}
      />,
    );
    const items = screen.getAllByTestId("accordion-item");
    expect(items).toHaveLength(3);
  });

  it("badge shows count of selected categories plus ignoreCategories", () => {
    const { useFilters } = jest.requireMock(
      "@/components/Filters/FiltersProvider",
    );
    useFilters.mockReturnValueOnce({
      dispatch: jest.fn(),
      filtersState: {
        ...initialState,
        categories: ["c1", "c2"],
        ignoreCategories: ["c3"],
      },
    });
    render(<Filters data={mockData} categories={true} />);
    const badges = screen.getAllByTestId("badge");
    // first badge should have content 3
    expect(badges[0].getAttribute("data-content")).toBe("3");
  });

  it("badge shows count for months", () => {
    const { useFilters } = jest.requireMock(
      "@/components/Filters/FiltersProvider",
    );
    useFilters.mockReturnValueOnce({
      dispatch: jest.fn(),
      filtersState: { ...initialState, months: ["2024-01"] },
    });
    render(<Filters data={mockData} months={true} />);
    const badges = screen.getAllByTestId("badge");
    expect(badges[0].getAttribute("data-content")).toBe("1");
  });

  it("badge shows count for sources", () => {
    const { useFilters } = jest.requireMock(
      "@/components/Filters/FiltersProvider",
    );
    useFilters.mockReturnValueOnce({
      dispatch: jest.fn(),
      filtersState: { ...initialState, sources: ["Barclays", "HSBC"] },
    });
    render(<Filters data={mockData} sources={true} />);
    const badges = screen.getAllByTestId("badge");
    expect(badges[0].getAttribute("data-content")).toBe("2");
  });

  it("renders FiltersCategories FiltersMonths FiltersSources passing dispatch filtersState", () => {
    render(<Filters data={mockData} categories months sources />);
    expect(screen.getByTestId("filters-categories")).toBeInTheDocument();
    expect(screen.getByTestId("filters-months")).toBeInTheDocument();
    expect(screen.getByTestId("filters-sources")).toBeInTheDocument();
  });
});
