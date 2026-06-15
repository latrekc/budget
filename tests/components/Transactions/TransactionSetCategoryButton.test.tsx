import TransactionSetCategoryButton from "@/components/Transactions/TransactionSetCategoryButton";
import { TransactionSetCategoryButton_Categories$key } from "@/components/Transactions/__generated__/TransactionSetCategoryButton_Categories.graphql";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { asFragment } from "../../utils/fragment";

type MockFn = jest.Mock<unknown, unknown[]>;
const mockOnSave: MockFn = jest.fn();
const mockUseTransactionSetCategory: MockFn = jest.fn(() => ({
  error: null,
  isMutationInFlight: false,
  onSave: mockOnSave,
}));

jest.mock("@/components/Transactions/useTransactionSetCategory", () => ({
  __esModule: true,
  default: (...args: unknown[]) =>
    (mockUseTransactionSetCategory as MockFn)(...args),
}));

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_: unknown, key: unknown) => key),
}));

type AutocompleteProps = {
  label: React.ReactNode;
  error?: string | null;
  isDisabled?: boolean;
  onSelect: (key: unknown) => void;
};

jest.mock("@/components/Categories/CategoryAutocomplete", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return function MockAutocomplete(props: AutocompleteProps) {
    return React.createElement(
      "div",
      { "data-testid": "category-autocomplete" },
      React.createElement("span", {}, props.label),
      props.error
        ? React.createElement("span", { "data-testid": "error" }, props.error)
        : null,
      React.createElement(
        "button",
        {
          "data-testid": "select-btn",
          disabled: props.isDisabled,
          onClick: () => props.onSelect("cat123"),
        },
        "Select",
      ),
    );
  };
});

describe("TransactionSetCategoryButton", () => {
  const mockOnCompleted = jest.fn();
  const categoriesKey = asFragment<TransactionSetCategoryButton_Categories$key>(
    {},
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTransactionSetCategory.mockReturnValue({
      error: null,
      isMutationInFlight: false,
      onSave: mockOnSave,
    });
  });

  it("renders CategoryAutocomplete label Update category error prop and asserts count 1 autocomplete", () => {
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        onCompleted={mockOnCompleted}
        transactions={[{ amount: 100, transaction: "t1" }]}
      />,
    );
    const autos = screen.getAllByTestId("category-autocomplete");
    expect(autos).toHaveLength(1);
    expect(screen.getByText("Update category")).toBeInTheDocument();
  });

  it("disabled when isMutationInFlight true", () => {
    mockUseTransactionSetCategory.mockReturnValue({
      error: null,
      isMutationInFlight: true,
      onSave: mockOnSave,
    });
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        onCompleted={mockOnCompleted}
        transactions={[{ amount: 100, transaction: "t1" }]}
      />,
    );
    const btn = screen.getByTestId("select-btn");
    expect(btn).toBeDisabled();
  });

  it("disabled when transactions length 0", () => {
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        onCompleted={mockOnCompleted}
        transactions={[]}
      />,
    );
    expect(screen.getByTestId("select-btn")).toBeDisabled();
  });

  it("renders error prop when hook returns error", () => {
    mockUseTransactionSetCategory.mockReturnValue({
      error: "Something failed",
      isMutationInFlight: false,
      onSave: mockOnSave,
    });
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        onCompleted={mockOnCompleted}
        transactions={[{ amount: 100, transaction: "t1" }]}
      />,
    );
    expect(screen.getByTestId("error")).toHaveTextContent("Something failed");
  });

  it("onSelect triggers useTransactionSetCategory hook onSave", () => {
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        onCompleted={mockOnCompleted}
        transactions={[{ amount: 100, transaction: "t1" }]}
      />,
    );
    fireEvent.click(screen.getByTestId("select-btn"));
    expect(mockOnSave).toHaveBeenCalledWith("cat123");
  });

  it("passes filters prop to hook when provided", () => {
    const filters = { onlyIncome: true } as unknown as Parameters<
      typeof TransactionSetCategoryButton
    >[0]["filters"];
    render(
      <TransactionSetCategoryButton
        categories={categoriesKey}
        filters={filters}
        onCompleted={mockOnCompleted}
        transactions="all"
      />,
    );
    expect(mockUseTransactionSetCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        filters,
        onCompleted: mockOnCompleted,
        transactions: "all",
      }),
    );
  });
});
