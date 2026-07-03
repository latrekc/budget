import { initialState } from "@/components/Filters/FiltersReducer";
import CategoriesFilter from "@/components/Filters/filter/CategoriesFilter";
import { CategoriesFilter_Categories$key } from "@/components/Filters/filter/__generated__/CategoriesFilter_Categories.graphql";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(() => ({})),
}));

jest.mock(
  "@/components/Transactions/TransactionSetCategoryButton",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "set-category-button",
    }),
);

describe("CategoriesFilter", () => {
  it("Popover button disabled if transactions length 0 and asserts disabled attribute", () => {
    render(
      <CategoriesFilter
        categories={asFragment<CategoriesFilter_Categories$key>({})}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
      />,
    );
    const button = screen.getByTestId("categories-button");
    expect(button).toBeDisabled();
  });

  it("does not open the popover when no transactions are selected", () => {
    render(
      <CategoriesFilter
        categories={asFragment<CategoriesFilter_Categories$key>({})}
        filters={initialState}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
      />,
    );
    // Even if the trigger fires (react-aria's PopoverTrigger opens regardless of
    // the child Button's disabled state), the popover must stay closed when there
    // is nothing selected.
    fireEvent.click(screen.getByTestId("popover-trigger"));
    expect(screen.getByTestId("popover")).toHaveAttribute(
      "data-is-open",
      "false",
    );
  });

  it("opens the popover when transactions are selected", () => {
    render(
      <CategoriesFilter
        categories={asFragment<CategoriesFilter_Categories$key>({})}
        filters={initialState}
        selectedTransactions={
          new Set([{ amount: 1, amount_converted: 1, transaction: "t" }])
        }
        setSelectedTransactions={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("popover-trigger"));
    expect(screen.getByTestId("popover")).toHaveAttribute(
      "data-is-open",
      "true",
    );
  });

  it("Popover button enabled when transactions length >0 and asserts enabled", () => {
    render(
      <CategoriesFilter
        categories={asFragment<CategoriesFilter_Categories$key>({})}
        filters={initialState}
        selectedTransactions={
          new Set([{ amount: 100, amount_converted: 100, transaction: "1" }])
        }
        setSelectedTransactions={jest.fn()}
      />,
    );
    const button = screen.getByTestId("categories-button");
    expect(button).not.toBeDisabled();
  });

  it("renders TransactionSetCategoryButton inside popover and asserts count 1", () => {
    render(
      <CategoriesFilter
        categories={asFragment<CategoriesFilter_Categories$key>({})}
        filters={initialState}
        selectedTransactions={
          new Set([{ amount: 1, amount_converted: 1, transaction: "t" }])
        }
        setSelectedTransactions={jest.fn()}
      />,
    );
    expect(screen.getByTestId("set-category-button")).toBeInTheDocument();
    expect(screen.getAllByTestId("set-category-button")).toHaveLength(1);
  });
});
