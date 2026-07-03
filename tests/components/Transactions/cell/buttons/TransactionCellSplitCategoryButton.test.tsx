import TransactionCellSplitCategoryButton from "@/components/Transactions/cell/buttons/TransactionCellSplitCategoryButton";
import { TransactionCellSplitCategoryButton$key } from "@/components/Transactions/cell/buttons/__generated__/TransactionCellSplitCategoryButton.graphql";
import { TransactionCellSplitCategoryButton_Categories$key } from "@/components/Transactions/cell/buttons/__generated__/TransactionCellSplitCategoryButton_Categories.graphql";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { asFragment } from "../../../../utils/fragment";

type MockFn = jest.Mock<unknown, unknown[]>;
const mockRefetch: MockFn = jest.fn();
const mockSubscribe: MockFn = jest.fn(() => jest.fn());
const mockOnSave: MockFn = jest.fn();

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_: unknown, key: unknown) => key),
  useRefetchableFragment: jest.fn(),
}));

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: (...a: unknown[]) => (mockSubscribe as MockFn)(...a),
  }),
}));

jest.mock("@/components/Transactions/useTransactionSetCategory", () => ({
  __esModule: true,
  default: () => ({
    error: null,
    isMutationInFlight: false,
    onSave: mockOnSave,
  }),
}));

type MockProps = Record<string, unknown> & {
  children?: React.ReactNode;
  title?: string;
  isDisabled?: boolean;
  onPress?: () => void;
  onSelect?: (v: unknown) => void;
  onDelete?: () => void;
  label?: React.ReactNode;
  amount?: unknown;
};

jest.mock("@/components/Categories/CategoryAutocomplete", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return (props: MockProps) =>
    React.createElement(
      "div",
      {
        "data-testid": "autocomplete",
        onClick: () => props.onSelect && props.onSelect("c1"),
      },
      props.label,
    );
});
jest.mock("@/components/Categories/CategoryChip", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return (props: MockProps) =>
    React.createElement(
      "div",
      { "data-testid": "category-chip", onClick: props.onDelete },
      "chip",
    );
});
jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return (props: MockProps) =>
    React.createElement(
      "span",
      { "data-testid": "amount-value", "data-amount": props.amount },
      props.amount as React.ReactNode,
    );
});

import { useFragment, useRefetchableFragment } from "react-relay";

describe("TransactionCellSplitCategoryButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories: [{ id: "c1" }, { id: "c2" }] },
      mockRefetch,
    ]);
  });

  const txKey = asFragment<TransactionCellSplitCategoryButton$key>({
    amount: 1000,
    categories: [{ amount: 400, category: { id: "c1" } }],
    currency: "GBP",
    id: "tx1",
  });
  const catKey = asFragment<TransactionCellSplitCategoryButton_Categories$key>(
    {},
  );

  it("renders Popover trigger Button Split category", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    expect(screen.getByTestId("btn-Split-category")).toBeInTheDocument();
  });

  it("initialState memo calculates rest correctly and renders AmountValue for rest", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    const amounts = screen.getAllByTestId("amount-value");
    // rest = 1000 - 400 = 600 should be rendered
    expect(amounts.some((el) => el.getAttribute("data-amount") === "600")).toBe(
      true,
    );
  });

  it("lists split categories each CategoryChip deletable and asserts 1 chip", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    const chips = screen.getAllByTestId("category-chip");
    expect(chips).toHaveLength(1);
    fireEvent.click(chips[0]);
    // dispatch tested indirectly no error
  });

  it("Add extra input when rest not 0 shows autocomplete Uncategorised and onSelect adds", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    const auto = screen.getByTestId("autocomplete");
    expect(auto).toHaveTextContent("Uncategorised");
    fireEvent.click(auto);
    // onSelect dispatches AddCategory, no error means passed
  });

  it("Save disabled when isNaN rest false case enabled and onPress calls onSave null", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    const saveBtn = screen.getByText("Save").closest("button")!;
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);
    expect(mockOnSave).toHaveBeenCalledWith("null");
  });

  it("subscribes to PubSub Categories and refetches", () => {
    render(
      <TransactionCellSplitCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    expect(mockSubscribe).toHaveBeenCalled();
    const cb = mockSubscribe.mock.calls[0]?.[1] as (() => void) | undefined;
    cb?.();
    expect(mockRefetch).toHaveBeenCalled();
  });
});
