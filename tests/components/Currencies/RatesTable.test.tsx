import RatesTable, { PER_PAGE } from "@/components/Currencies/RatesTable";
import { RatesTable$key } from "@/components/Currencies/__generated__/RatesTable.graphql";
import { Currency, DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

const mockUsePaginationFragment = jest.fn();
const mockUseFragment = jest.fn();
const mockRefetch = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  usePaginationFragment: (f: unknown, k: unknown) =>
    mockUsePaginationFragment(f, k),
  useFragment: (f: unknown, k: unknown) => mockUseFragment(f, k),
}));

jest.mock("@/components/Currencies/cell/RateDateCell", () => () => (
  <span data-testid="rate-date-cell">Date</span>
));
jest.mock("@/components/Currencies/cell/RateValueCell", () => () => (
  <span data-testid="rate-value-cell">Value</span>
));
jest.mock("@/components/Currencies/cell/RateDeleteCell", () => () => (
  <span data-testid="rate-delete-cell">Delete</span>
));

const mockSubscribe = jest.fn();
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: mockSubscribe.mockImplementation(() => jest.fn()),
  }),
}));

describe("RatesTable Component", () => {
  const mockRatesKey = asFragment<RatesTable$key>({});
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFragment.mockReturnValue({});
  });
  const createMockData = (
    count: number = 3,
    options?: { hasNext?: boolean; isLoadingNext?: boolean },
  ) => ({
    data: {
      rates: {
        edges: Array(count).fill({ node: { id: "1" } }),
        pageInfo: { hasNextPage: options?.hasNext ?? false },
      },
    },
    hasNext: options?.hasNext ?? false,
    isLoadingNext: options?.isLoadingNext ?? false,
    loadNext: jest.fn(),
    refetch: mockRefetch,
  });
  it("renders table with correct title", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(
      screen.getByText(`Currency rates for USD to ${DEFAULT_CURRENCY}`),
    ).toBeInTheDocument();
  });
  it("renders table headers for Date, Value, and Delete columns", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    const columns = screen.getAllByTestId("table-column");
    expect(columns).toHaveLength(3);
    expect(columns[0]).toHaveTextContent("Date");
    expect(columns[1]).toHaveTextContent("Value");
  });
  it("displays empty content when no records", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(0));
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(screen.getByText("No records")).toBeInTheDocument();
  });
  it("subscribes to currency exchange rate updates", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(mockSubscribe).toHaveBeenCalledWith(
      PubSubChannels.CurrencyExchangeRates,
      expect.any(Function),
    );
  });
  it("applies correct text alignment for columns", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(1));
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    const columns = screen.getAllByTestId("table-column");
    expect(columns[0]).toHaveClass("text-left");
    expect(columns[1]).toHaveClass("text-right");
  });
  it("renders table with correct aria-label", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(screen.getByTestId("table-content")).toHaveAttribute(
      "data-aria-label",
      "Rates",
    );
  });
  it("handles different currencies in title", () => {
    [Currency.USD, Currency.EUR, Currency.GBP, Currency.JPY].forEach(
      (currency) => {
        mockUsePaginationFragment.mockReturnValue(createMockData());
        const { unmount } = render(
          <RatesTable currency={currency} rates={mockRatesKey} />,
        );
        expect(
          screen.getByText(
            `Currency rates for ${currency} to ${DEFAULT_CURRENCY}`,
          ),
        ).toBeInTheDocument();
        unmount();
      },
    );
  });
  it("exports PER_PAGE constant with correct value", () => {
    expect(PER_PAGE).toBe(20);
  });
  it("calls refetch on pubsub event", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    const callback = mockSubscribe.mock.calls[0][1];
    callback();
    expect(mockRefetch).toHaveBeenCalledWith(
      { base: DEFAULT_CURRENCY, target: Currency.USD },
      { fetchPolicy: "network-only" },
    );
  });
  it("renders an idle LoadMore sentinel when hasNext is true", () => {
    mockUsePaginationFragment.mockReturnValue(
      createMockData(3, { hasNext: true }),
    );
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(screen.getByTestId("table-load-more")).toHaveAttribute(
      "data-is-loading",
      "false",
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
  it("renders spinner in LoadMore sentinel when isLoadingNext is true", () => {
    mockUsePaginationFragment.mockReturnValue(
      createMockData(3, { isLoadingNext: true }),
    );
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    expect(screen.getByTestId("table-load-more")).toHaveAttribute(
      "data-is-loading",
      "true",
    );
    expect(screen.getAllByTestId("spinner").length).toBeGreaterThan(0);
  });
  it("renders table rows for X items", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(5));
    render(<RatesTable currency={Currency.USD} rates={mockRatesKey} />);
    // TableBody receives items prop but mocked; verify via mock call count indirect through rendered output not available, so assert table exists and no empty content
    expect(screen.queryByText("No records")).not.toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getAllByTestId("table-row")).toHaveLength(5);
  });
});
