import Currencies from "@/components/Currencies";
import { Currencies$data } from "@/components/Currencies/__generated__/Currencies.graphql";
import { CurrenciesQuery } from "@/components/Currencies/__generated__/CurrenciesQuery.graphql";
import { Currency, DEFAULT_CURRENCY, PubSubChannels } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";
import { asFragment } from "../../utils/fragment";

const mockUsePreloadedQuery = jest.fn();
const mockUseRefetchableFragment = jest.fn();
const mockRefetch = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  usePreloadedQuery: (q: unknown, p: unknown) => mockUsePreloadedQuery(q, p),
  useRefetchableFragment: (f: unknown, d: unknown) =>
    mockUseRefetchableFragment(f, d),
}));

jest.mock("react-icons/pi", () => ({
  PiCurrencyGbpBold: () => <svg data-testid="icon-gbp" />,
  PiCurrencyEurBold: () => <svg data-testid="icon-eur" />,
  PiCurrencyRubBold: () => <svg data-testid="icon-rub" />,
  PiCurrencyDollarBold: () => <svg data-testid="icon-usd" />,
  PiCurrencyJpyBold: () => <svg data-testid="icon-jpy" />,
}));

jest.mock("@/components/Currencies/CurrencyRates", () => {
  return function MockCurrencyRates({ currency }: { currency: Currency }) {
    return (
      <div data-testid={`currency-rates-${currency}`}>Rates for {currency}</div>
    );
  };
});

const mockSubscribe = jest.fn();
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: mockSubscribe.mockImplementation(() => jest.fn()),
  }),
}));

describe("Currencies Component", () => {
  const mockPreloadedQuery = asFragment<PreloadedQuery<CurrenciesQuery>>({});
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const setupMocks = (currencies: Currencies$data["currencies"]) => {
    mockUsePreloadedQuery.mockReturnValue({});
    mockUseRefetchableFragment.mockReturnValue([{ currencies }, mockRefetch]);
  };
  it("renders currency list with tabs", () => {
    setupMocks([
      { currency: Currency.USD, rateClaims: 5, rates: 10 },
      { currency: Currency.EUR, rateClaims: 0, rates: 8 },
      { currency: Currency.GBP, rateClaims: 3, rates: 0 },
    ]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("icon-usd")).toBeInTheDocument();
    expect(screen.getByTestId("icon-eur")).toBeInTheDocument();
    expect(screen.getByTestId("icon-gbp")).toBeInTheDocument();
  });
  it("filters out currencies with no rates and no claims", () => {
    setupMocks([
      { currency: Currency.USD, rateClaims: 5, rates: 10 },
      { currency: Currency.EUR, rateClaims: 0, rates: 0 },
      { currency: Currency.JPY, rateClaims: 0, rates: 0 },
      { currency: Currency.GBP, rateClaims: 3, rates: 0 },
    ]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getByTestId("icon-usd")).toBeInTheDocument();
    expect(screen.getByTestId("icon-gbp")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-eur")).not.toBeInTheDocument();
    expect(screen.queryByTestId("icon-jpy")).not.toBeInTheDocument();
  });
  it("displays rate claims chip when claims exist", () => {
    setupMocks([
      { currency: Currency.USD, rateClaims: 5, rates: 10 },
      { currency: Currency.EUR, rateClaims: 0, rates: 8 },
    ]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    const chips = screen.getAllByTestId("chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveTextContent("5");
  });
  it("does not display chip when no rate claims", () => {
    setupMocks([{ currency: Currency.EUR, rateClaims: 0, rates: 8 }]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.queryByTestId("chip")).not.toBeInTheDocument();
  });
  it("subscribes to currency exchange rate updates", () => {
    setupMocks([{ currency: Currency.USD, rateClaims: 5, rates: 10 }]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(mockSubscribe).toHaveBeenCalledWith(
      PubSubChannels.CurrencyExchangeRates,
      expect.any(Function),
    );
  });
  it("renders CurrencyRates component for each currency tab", () => {
    setupMocks([
      { currency: Currency.USD, rateClaims: 5, rates: 10 },
      { currency: Currency.EUR, rateClaims: 0, rates: 8 },
    ]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getByTestId("currency-rates-USD")).toBeInTheDocument();
    expect(screen.getByTestId("currency-rates-EUR")).toBeInTheDocument();
  });
  it("handles empty currencies list", () => {
    setupMocks([]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();
  });
  it("handles null currencies", () => {
    setupMocks(null);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.queryByTestId(/icon-/)).not.toBeInTheDocument();
  });
  it("calls refetch on pubsub event", () => {
    setupMocks([{ currency: Currency.USD, rateClaims: 5, rates: 10 }]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    const callback = mockSubscribe.mock.calls[0][1];
    callback();
    expect(mockRefetch).toHaveBeenCalledWith(
      { base: DEFAULT_CURRENCY },
      { fetchPolicy: "network-only" },
    );
  });
  it("displays multiple rate claims chips accurately per currency", () => {
    setupMocks([
      { currency: Currency.USD, rateClaims: 5, rates: 10 },
      { currency: Currency.EUR, rateClaims: 3, rates: 8 },
      { currency: Currency.GBP, rateClaims: 0, rates: 7 },
    ]);
    render(<Currencies preloadedQuery={mockPreloadedQuery} />);
    const chips = screen.getAllByTestId("chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent("5");
    expect(chips[1]).toHaveTextContent("3");
  });
});
