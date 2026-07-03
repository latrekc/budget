import Page from "@/currencies/page";
import { DEFAULT_CURRENCY } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PreloadedQuery } from "react-relay";

import { CurrenciesQuery } from "@/components/Currencies/__generated__/CurrenciesQuery.graphql";

const mockUseQueryLoader = jest.fn();
const mockLoadQuery = jest.fn();
const mockUseDeferredValue = jest.fn((v) => v);

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
    const MockRates = ({ preloadedQuery }: { preloadedQuery: unknown }) => (
      <div data-testid="rates-component">
        Rates preloaded {preloadedQuery ? "yes" : "no"}
      </div>
    );
    return MockRates;
  },
}));

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: ({ active }: { active: unknown }) => (
    <div data-testid="header">Header active {String(active)}</div>
  ),
  PageType: { Currencies: "Currencies" },
}));

jest.mock("@/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading</div>,
}));

jest.mock("@/components/Currencies", () => ({
  CurrenciesQuery: {},
}));

describe("Currencies Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeferredValue.mockImplementation((v) => v);
  });

  it("renders Loading when preloadedQuery is null", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("rates-component")).not.toBeInTheDocument();
  });

  it("renders Currencies component with Suspense fallback when preloadedQuery loaded", () => {
    const mockPreloaded = {} as PreloadedQuery<CurrenciesQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);

    render(<Page />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("rates-component")).toBeInTheDocument();
    expect(screen.getByText("Rates preloaded yes")).toBeInTheDocument();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("calls loadQuery with base DEFAULT_CURRENCY on mount", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    expect(mockLoadQuery).toHaveBeenCalledTimes(1);
    expect(mockLoadQuery).toHaveBeenCalledWith(
      { base: DEFAULT_CURRENCY },
      { fetchPolicy: "store-and-network" },
    );
  });

  it("passes preloadedQuery correctly to Rates component", () => {
    const mockPreloaded = {
      test: "query",
    } as unknown as PreloadedQuery<CurrenciesQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);

    render(<Page />);

    const rates = screen.getByTestId("rates-component");
    expect(rates).toHaveTextContent("Rates preloaded yes");
  });

  it("applies opacity-50 class when deferredQuery differs from preloadedQuery", () => {
    const mockPreloaded = {
      id: 1,
    } as unknown as PreloadedQuery<CurrenciesQuery>;
    const mockDeferred = {
      id: 2,
    } as unknown as PreloadedQuery<CurrenciesQuery>;
    mockUseQueryLoader.mockReturnValue([mockPreloaded, mockLoadQuery]);
    let callCount = 0;
    mockUseDeferredValue.mockImplementation((v) => {
      callCount += 1;
      return callCount === 1 ? mockDeferred : v;
    });

    const { container } = render(<Page />);

    const opacityDiv = container.querySelector(".opacity-50");
    expect(opacityDiv).toBeInTheDocument();
    expect(screen.getByTestId("rates-component")).toBeInTheDocument();
  });

  it("renders Header with active PageType Currencies", () => {
    mockUseQueryLoader.mockReturnValue([null, mockLoadQuery]);

    render(<Page />);

    const header = screen.getByTestId("header");
    expect(header).toHaveTextContent("Header active Currencies");
  });
});
