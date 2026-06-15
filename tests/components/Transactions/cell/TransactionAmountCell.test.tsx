import TransactionAmountCell from "@/components/Transactions/cell/TransactionAmountCell";
import { TransactionAmountCell$key } from "@/components/Transactions/cell/__generated__/TransactionAmountCell.graphql";
import { DEFAULT_CURRENCY } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, data) => data),
}));

jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  function MockAmountValue(props: Record<string, unknown>) {
    return React.createElement(
      "span",
      {
        "data-testid": "amount-value",
        "data-currency": props.currency,
        "data-amount": props.amount,
      },
      `${props.currency}:${props.amount}`,
    );
  }
  return {
    __esModule: true,
    default: MockAmountValue,
    Size: { Small: 0, Normal: 1, Big: 2 },
  };
});

import { useFragment } from "react-relay";

describe("TransactionAmountCell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setup(data: unknown) {
    (useFragment as jest.Mock).mockReturnValue(data);
  }

  it("always renders AmountValue amount currency size Big", () => {
    setup({
      amount: 12345,
      amount_converted: null,
      currency: DEFAULT_CURRENCY,
    });
    render(
      <TransactionAmountCell
        transaction={asFragment<TransactionAmountCell$key>({})}
      />,
    );
    const av = screen.getAllByTestId("amount-value");
    expect(av).toHaveLength(1);
    expect(av[0]).toHaveAttribute("data-currency", DEFAULT_CURRENCY);
    expect(av[0]).toHaveAttribute("data-amount", "12345");
  });

  it("currency not DEFAULT renders second line with amountConverted", () => {
    setup({ amount: 1000, amount_converted: 850, currency: "USD" });
    render(
      <TransactionAmountCell
        transaction={asFragment<TransactionAmountCell$key>({})}
      />,
    );
    const av = screen.getAllByTestId("amount-value");
    expect(av).toHaveLength(2);
    expect(av[0]).toHaveAttribute("data-currency", "USD");
    expect(av[1]).toHaveAttribute("data-currency", DEFAULT_CURRENCY);
    expect(av[1]).toHaveAttribute("data-amount", "850");
  });

  it("currency not DEFAULT and amountConverted null renders Exchange rate is not defined in red bold", () => {
    setup({ amount: 1000, amount_converted: null, currency: "EUR" });
    render(
      <TransactionAmountCell
        transaction={asFragment<TransactionAmountCell$key>({})}
      />,
    );
    expect(
      screen.getByText("Exchange rate is not defined"),
    ).toBeInTheDocument();
    expect(screen.getByText("Exchange rate is not defined")).toHaveClass(
      "font-bold",
      "text-red-900",
    );
    const av = screen.getAllByTestId("amount-value");
    expect(av).toHaveLength(1);
  });
});
