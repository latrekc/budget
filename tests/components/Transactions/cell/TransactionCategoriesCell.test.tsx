import TransactionCategoriesCell from "@/components/Transactions/cell/TransactionCategoriesCell";
import { TransactionCategoriesCell$key } from "@/components/Transactions/cell/__generated__/TransactionCategoriesCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_fragment, key) => {
    if (typeof key === "object" && key && "categories" in key) return key;
    return key;
  }),
}));

jest.mock("@/components/Categories/CategoryChip", () => {
  const React = jest.requireActual("react") as typeof import("react");
  return function MockChip(props: Record<string, unknown>) {
    return React.createElement(
      "div",
      { "data-testid": "category-chip", "data-amount": props.amount ?? "null" },
      "chip",
    );
  };
});

jest.mock(
  "@/components/Transactions/cell/buttons/useTransactionCellDeleteCategoryButton",
  () => ({
    __esModule: true,
    default: () => ({ isDisabledDelete: false, onDelete: jest.fn() }),
  }),
);

import { useFragment } from "react-relay";

describe("TransactionCategoriesCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("flex wrap renders CategoryChip with amount null when single category and completed true and asserts 1 chip", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const data = {
      categories: [{ amount: 1000, category: { id: "c1" } }],
      completed: true,
      currency: "GBP",
    };
    render(
      <TransactionCategoriesCell
        transaction={asFragment<TransactionCategoriesCell$key>(data)}
      />,
    );
    const chips = screen.getAllByTestId("category-chip");
    expect(chips).toHaveLength(1);
    expect(chips[0]).toHaveAttribute("data-amount", "null");
  });

  it("categories length >1 renders amount prop record.amount and asserts 2 chips", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const data = {
      categories: [
        { amount: 600, category: { id: "c1" } },
        { amount: 400, category: { id: "c2" } },
      ],
      completed: true,
      currency: "GBP",
    };
    render(
      <TransactionCategoriesCell
        transaction={asFragment<TransactionCategoriesCell$key>(data)}
      />,
    );
    const chips = screen.getAllByTestId("category-chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveAttribute("data-amount", "600");
    expect(chips[1]).toHaveAttribute("data-amount", "400");
  });

  it("not completed renders amount even with single category", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const data = {
      categories: [{ amount: 1000, category: { id: "c1" } }],
      completed: false,
      currency: "GBP",
    };
    render(
      <TransactionCategoriesCell
        transaction={asFragment<TransactionCategoriesCell$key>(data)}
      />,
    );
    const chip = screen.getByTestId("category-chip");
    expect(chip).toHaveAttribute("data-amount", "1000");
  });
});
