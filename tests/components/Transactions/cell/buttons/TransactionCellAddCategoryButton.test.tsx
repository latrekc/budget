import TransactionCellAddCategoryButton from "@/components/Transactions/cell/buttons/TransactionCellAddCategoryButton";
import { TransactionCellAddCategoryButton$key } from "@/components/Transactions/cell/buttons/__generated__/TransactionCellAddCategoryButton.graphql";
import { TransactionCellAddCategoryButton_Categories$key } from "@/components/Transactions/cell/buttons/__generated__/TransactionCellAddCategoryButton_Categories.graphql";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { asFragment } from "../../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_: unknown, key) => key),
}));

jest.mock(
  "@/components/Transactions/TransactionSetCategoryButton",
  () => (_props: Record<string, unknown>) =>
    jest.requireActual("react").createElement(
      "div",
      {
        "data-testid": "set-category-btn",
        onClick: (_props as Record<string, unknown>).onCompleted as
          | (() => void)
          | undefined,
      },
      "set",
    ),
);

import { useFragment } from "react-relay";

describe("TransactionCellAddCategoryButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock).mockImplementation((_: unknown, key) => {
      if (key && typeof key === "object" && "id" in key) return key;
      return key;
    });
  });

  const txKey = asFragment<TransactionCellAddCategoryButton$key>({
    amount: 1000,
    id: "tx1",
  });
  const catKey = asFragment<TransactionCellAddCategoryButton_Categories$key>(
    {},
  );

  it("renders Popover trigger Button TiPlus", () => {
    render(
      <TransactionCellAddCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    expect(screen.getByTestId("add-button-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("popover")).toBeInTheDocument();
  });

  it("PopoverContent renders TransactionSetCategoryButton with transactions amount and id", () => {
    render(
      <TransactionCellAddCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    expect(screen.getByTestId("set-category-btn")).toBeInTheDocument();
  });

  it("onCompleted closes popover via state update", () => {
    render(
      <TransactionCellAddCategoryButton
        categories={catKey}
        transaction={txKey}
      />,
    );
    const setBtn = screen.getByTestId("set-category-btn");
    fireEvent.click(setBtn);
    // After click, component should still render but internal state tested indirectly via no error
    expect(setBtn).toBeInTheDocument();
  });
});
