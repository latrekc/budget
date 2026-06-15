import CurrencyRates from "@/components/Currencies/CurrencyRates";
import { CurrencyRatesQuery } from "@/components/Currencies/__generated__/CurrencyRatesQuery.graphql";
import { Currency } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

const mockUseLazyLoadQuery = jest.fn();
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useLazyLoadQuery: (q: unknown, v: unknown, o: unknown) =>
    mockUseLazyLoadQuery(q, v, o),
}));

jest.mock("@/components/Currencies/RateClaimsTable", () => {
  const Mock = Object.assign(
    ({ currency }: { currency: Currency }) => (
      <div data-testid={`rate-claims-table-${currency}`}>
        Rate Claims Table for {currency}
      </div>
    ),
    { PER_PAGE: 20 },
  );
  return Mock;
});

jest.mock("@/components/Currencies/RatesTable", () => {
  return function MockRatesTable({ currency }: { currency: Currency }) {
    return (
      <div data-testid={`rates-table-${currency}`}>
        Rates Table for {currency}
      </div>
    );
  };
});

jest.mock("@/components/Loading", () => () => (
  <div data-testid="loading">Loading...</div>
));

describe("CurrencyRates Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLazyLoadQuery.mockReturnValue(
      asFragment<CurrencyRatesQuery["response"]>({}),
    );
  });
  it("renders two-column layout with rate claims and rates tables", () => {
    render(<CurrencyRates currency={Currency.USD} />);
    const rateClaimsTable = screen.getByTestId("rate-claims-table-USD");
    const flexContainer = rateClaimsTable.closest(".flex.flex-row");
    expect(flexContainer).toBeInTheDocument();
    expect(screen.getByTestId("rate-claims-table-USD")).toBeInTheDocument();
    expect(screen.getByTestId("rates-table-USD")).toBeInTheDocument();
  });
  it("passes correct currency prop to child components", () => {
    render(<CurrencyRates currency={Currency.EUR} />);
    expect(screen.getByTestId("rate-claims-table-EUR")).toBeInTheDocument();
    expect(screen.getByTestId("rates-table-EUR")).toBeInTheDocument();
  });
  it("renders with different currencies", () => {
    [
      Currency.USD,
      Currency.EUR,
      Currency.GBP,
      Currency.JPY,
      Currency.RUB,
    ].forEach((currency) => {
      const { unmount } = render(<CurrencyRates currency={currency} />);
      expect(
        screen.getByTestId(`rate-claims-table-${currency}`),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`rates-table-${currency}`)).toBeInTheDocument();
      unmount();
    });
  });
  it("has correct layout classes for responsive design", () => {
    render(<CurrencyRates currency={Currency.USD} />);
    const rateClaimsContainer = screen.getByTestId("rate-claims-table-USD")
      .parentElement?.parentElement;
    const ratesContainer =
      screen.getByTestId("rates-table-USD").parentElement?.parentElement;
    expect(rateClaimsContainer).toHaveClass("basis-1/2", "py-3");
    expect(ratesContainer).toHaveClass("basis-1/2", "py-3");
  });
  it("calls useLazyLoadQuery with correct variables", () => {
    render(<CurrencyRates currency={Currency.USD} />);
    expect(mockUseLazyLoadQuery).toHaveBeenCalledWith(
      expect.anything(),
      {
        base: expect.anything(),
        currency: Currency.USD,
        first: 20,
        target: Currency.USD,
      },
      { fetchPolicy: "store-or-network" },
    );
  });
});
