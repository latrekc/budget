import TransactionDescriptionCell from "@/components/Transactions/cell/TransactionDescriptionCell";
import { TransactionDescriptionCell$key } from "@/components/Transactions/cell/__generated__/TransactionDescriptionCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, data) => data),
}));

jest.mock("date-format-parse", () => ({
  format: jest.fn(() => "1 January 2024, Monday"),
}));

import { useFragment } from "react-relay";

describe("TransactionDescriptionCell", () => {
  it("renders select-all text-base description", () => {
    (useFragment as jest.Mock).mockReturnValue({
      date: "2024-01-01",
      description: "Coffee shop",
    });
    render(
      <TransactionDescriptionCell
        transaction={asFragment<TransactionDescriptionCell$key>({})}
      />,
    );
    const desc = screen.getByText("Coffee shop");
    expect(desc).toHaveClass("select-all", "text-base");
  });

  it("renders text-xs formatted date D MMMM YYYY dddd", () => {
    (useFragment as jest.Mock).mockReturnValue({
      date: "2024-01-01",
      description: "Test",
    });
    render(
      <TransactionDescriptionCell
        transaction={asFragment<TransactionDescriptionCell$key>({})}
      />,
    );
    const dateEl = screen.getByText("1 January 2024, Monday");
    expect(dateEl).toHaveClass("text-xs");
  });
});
