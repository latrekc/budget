import TransactionCategoriesButtonCell from "@/components/Transactions/cell/TransactionCategoriesButtonCell";
import { TransactionCategoriesButtonCell$key } from "@/components/Transactions/cell/__generated__/TransactionCategoriesButtonCell.graphql";
import { TransactionCategoriesButtonCell_Categories$key } from "@/components/Transactions/cell/__generated__/TransactionCategoriesButtonCell_Categories.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_: unknown, key) => key),
}));

jest.mock(
  "@/components/Transactions/cell/buttons/TransactionCellAddCategoryButton",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "add-btn" }),
);
jest.mock(
  "@/components/Transactions/cell/buttons/TransactionCellSplitCategoryButton",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "split-btn" }),
);

import { useFragment } from "react-relay";

describe("TransactionCategoriesButtonCell", () => {
  const categoriesKey =
    asFragment<TransactionCategoriesButtonCell_Categories$key>({});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("if transaction amount 0 return null and asserts 0 buttons", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const tx = { amount: 0, categories: [] };
    const { container } = render(
      <TransactionCategoriesButtonCell
        categories={categoriesKey}
        transaction={asFragment<TransactionCategoriesButtonCell$key>(tx)}
      />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryAllByTestId("add-btn")).toHaveLength(0);
    expect(screen.queryAllByTestId("split-btn")).toHaveLength(0);
  });

  it("amount non-zero renders div flex gap-2 show add button if categories length 0 and always split and asserts 2 buttons", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const tx = { amount: 1000, categories: [] };
    render(
      <TransactionCategoriesButtonCell
        categories={categoriesKey}
        transaction={asFragment<TransactionCategoriesButtonCell$key>(tx)}
      />,
    );
    expect(screen.getByTestId("add-btn")).toBeInTheDocument();
    expect(screen.getByTestId("split-btn")).toBeInTheDocument();
  });

  it("categories length >0 hides add button shows only split and asserts 1 button", () => {
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => key);
    const tx = { amount: 1000, categories: [{ __typename: "x" }] };
    render(
      <TransactionCategoriesButtonCell
        categories={categoriesKey}
        transaction={asFragment<TransactionCategoriesButtonCell$key>(tx)}
      />,
    );
    expect(screen.queryByTestId("add-btn")).not.toBeInTheDocument();
    expect(screen.getByTestId("split-btn")).toBeInTheDocument();
  });
});
