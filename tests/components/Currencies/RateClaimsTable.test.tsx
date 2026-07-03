import RateClaimsTable, {
  PER_PAGE,
} from "@/components/Currencies/RateClaimsTable";
import { RateClaimsTable$key } from "@/components/Currencies/__generated__/RateClaimsTable.graphql";
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

jest.mock("@/components/Currencies/cell/RateClaimDateCell", () => () => (
  <span data-testid="rate-claim-date-cell">Date</span>
));
jest.mock("@/components/Currencies/cell/RateClaimValueCell", () => () => (
  <span data-testid="rate-claim-value-cell">Value</span>
));

const mockSubscribe = jest.fn();
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: mockSubscribe.mockImplementation(() => jest.fn()),
  }),
}));

describe("RateClaimsTable Component", () => {
  const mockClaimsKey = asFragment<RateClaimsTable$key>({});
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFragment.mockReturnValue({});
  });
  const createMockData = (
    count: number = 3,
    options?: { hasNext?: boolean; isLoadingNext?: boolean },
  ) => ({
    data: {
      rate_claims: {
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
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    expect(
      screen.getByText(
        `Claims for currency rates for USD to ${DEFAULT_CURRENCY}`,
      ),
    ).toBeInTheDocument();
  });
  it("renders table headers for Date and Value columns", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    const columns = screen.getAllByTestId("table-column");
    expect(columns).toHaveLength(2);
    expect(columns[0]).toHaveTextContent("Date");
    expect(columns[1]).toHaveTextContent("Value");
  });
  it("displays empty content when no records", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(0));
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    expect(screen.getByText("No records")).toBeInTheDocument();
  });
  it("subscribes to currency exchange rate updates", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    expect(mockSubscribe).toHaveBeenCalledWith(
      PubSubChannels.CurrencyExchangeRates,
      expect.any(Function),
    );
  });
  it("applies correct text alignment for columns", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(1));
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    const columns = screen.getAllByTestId("table-column");
    expect(columns[0]).toHaveClass("text-left");
    expect(columns[1]).toHaveClass("text-right");
  });
  it("renders table with correct aria-label", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData());
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
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
          <RateClaimsTable claims={mockClaimsKey} currency={currency} />,
        );
        expect(
          screen.getByText(
            `Claims for currency rates for ${currency} to ${DEFAULT_CURRENCY}`,
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
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    const callback = mockSubscribe.mock.calls[0][1];
    callback();
    expect(mockRefetch).toHaveBeenCalledWith(
      { currency: Currency.USD },
      { fetchPolicy: "network-only" },
    );
  });
  it("renders an idle LoadMore sentinel when hasNext is true", () => {
    mockUsePaginationFragment.mockReturnValue(
      createMockData(3, { hasNext: true }),
    );
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
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
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    expect(screen.getByTestId("table-load-more")).toHaveAttribute(
      "data-is-loading",
      "true",
    );
    expect(screen.getAllByTestId("spinner").length).toBeGreaterThan(0);
  });
  it("renders table rows for X items", () => {
    mockUsePaginationFragment.mockReturnValue(createMockData(5));
    render(<RateClaimsTable claims={mockClaimsKey} currency={Currency.USD} />);
    expect(screen.queryByText("No records")).not.toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getAllByTestId("table-row")).toHaveLength(5);
  });
});
