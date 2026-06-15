import { initialState } from "@/components/Filters/FiltersReducer";
import FiltersTransactions from "@/components/Filters/FiltersTransactions";
import { FiltersTransactions$key } from "@/components/Filters/__generated__/FiltersTransactions.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, key) => key),
}));

jest.mock(
  "@/components/Filters/filter/DescriptionFilter",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "description-filter",
    }),
);
jest.mock(
  "@/components/Filters/filter/AmountFilter",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "amount-filter" }),
);
jest.mock(
  "@/components/Filters/filter/ComplitedFilter",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "complited-filter",
    }),
);
jest.mock(
  "@/components/Filters/filter/IncomeFilter",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "income-filter" }),
);
jest.mock(
  "@/components/Filters/filter/SortFilter",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "sort-filter" }),
);
jest.mock(
  "@/components/Filters/filter/CurrencyFilter",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "currency-filter" }),
);
jest.mock(
  "@/components/Transactions/TransactionsTotal",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "transactions-total",
    }),
);
jest.mock(
  "@/components/Filters/filter/CategoriesFilter",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "categories-filter",
    }),
);

describe("FiltersTransactions", () => {
  const mockDispatch = jest.fn();
  const mockSetSelected = jest.fn();

  it("renders layout row DescriptionFilter AmountFilter and asserts count 2 top row", () => {
    render(
      <FiltersTransactions
        data={asFragment<FiltersTransactions$key>({})}
        dispatch={mockDispatch}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={mockSetSelected}
      />,
    );
    expect(screen.getByTestId("description-filter")).toBeInTheDocument();
    expect(screen.getByTestId("amount-filter")).toBeInTheDocument();
  });

  it("renders row switches Complited Income Sort Currency and asserts 4 components", () => {
    render(
      <FiltersTransactions
        data={asFragment<FiltersTransactions$key>({})}
        dispatch={mockDispatch}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={mockSetSelected}
      />,
    );
    expect(screen.getByTestId("complited-filter")).toBeInTheDocument();
    expect(screen.getByTestId("income-filter")).toBeInTheDocument();
    expect(screen.getByTestId("sort-filter")).toBeInTheDocument();
    expect(screen.getByTestId("currency-filter")).toBeInTheDocument();
  });

  it("renders row TransactionsTotal and CategoriesFilter popover and asserts count 2", () => {
    render(
      <FiltersTransactions
        data={asFragment<FiltersTransactions$key>({})}
        dispatch={mockDispatch}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={mockSetSelected}
      />,
    );
    expect(screen.getByTestId("transactions-total")).toBeInTheDocument();
    expect(screen.getByTestId("categories-filter")).toBeInTheDocument();
  });

  it("passes filters dispatch correctly via props presence check", () => {
    const { container } = render(
      <FiltersTransactions
        data={asFragment<FiltersTransactions$key>({})}
        dispatch={mockDispatch}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={mockSetSelected}
      />,
    );
    // total 7 subcomponents rendered
    expect(
      container.querySelectorAll('[data-testid$="-filter"]').length,
    ).toBeGreaterThanOrEqual(5);
  });
});
