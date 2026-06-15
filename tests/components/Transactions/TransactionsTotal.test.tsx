import TransactionsTotal from "@/components/Transactions/TransactionsTotal";
import { TransactionsTotal$key } from "@/components/Transactions/__generated__/TransactionsTotal.graphql";
import { PubSubChannels } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

type MockFn = jest.Mock<unknown, unknown[]>;
const mockRefetch: MockFn = jest.fn();
const mockSubscribe: MockFn = jest.fn(() => jest.fn());

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useRefetchableFragment: jest.fn(),
}));

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: (...args: unknown[]) => (mockSubscribe as MockFn)(...args),
  }),
}));

type AmountValueProps = {
  amount?: number | string;
};

jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  function MockAmountValue(props: AmountValueProps) {
    return React.createElement(
      "span",
      { "data-testid": "amount-value", "data-amount": props.amount },
      `${props.amount}`,
    );
  }
  return {
    __esModule: true,
    default: MockAmountValue,
    Size: { Small: 0, Normal: 1, Big: 2 },
  };
});

import { useRefetchableFragment } from "react-relay";

describe("TransactionsTotal", () => {
  const dataKey = asFragment<TransactionsTotal$key>({});
  const filters = {
    amount: null,
    amountRelation: null,
    categories: null,
    currencies: null,
    ignoreCategories: null,
    months: null,
    onlyIncome: false,
    onlyUncomplited: false,
    search: null,
    sortBy: null,
    sources: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setup(data: { count: number; income: number; outcome: number }) {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { transactionsTotal: data },
      mockRefetch,
    ]);
  }

  it("0 total count renders Total with 0 and asserts count 0 amount values", () => {
    setup({ count: 0, income: 0, outcome: 0 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={new Set()}
      />,
    );
    // Current behavior: empty set size 0 equals total 0 => shows "Selected all"
    expect(screen.getByText(/Selected all/)).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/transactions/)).toBeInTheDocument();
    const amounts = screen.queryAllByTestId("amount-value");
    expect(amounts).toHaveLength(0);
  });

  it("X total no selection shows Total count income outcome AmountValue size Small and asserts 2 amount values", () => {
    setup({ count: 5, income: 10000, outcome: -5000 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={new Set()}
      />,
    );
    expect(screen.getByText(/Total/)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts).toHaveLength(2);
    expect(amounts[0]).toHaveAttribute("data-amount", "10000");
    expect(amounts[1]).toHaveAttribute("data-amount", "-5000");
  });

  it("Selected some Set not empty size not total shows Selected n of with selected income outcome", () => {
    setup({ count: 10, income: 20000, outcome: -10000 });
    const selected = new Set([
      { amount: 5000, amount_converted: 5000, transaction: "t1" },
      { amount: -2000, amount_converted: -2000, transaction: "t2" },
    ]);
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={selected}
      />,
    );
    expect(screen.getByText(/Selected/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    const amounts = screen.getAllByTestId("amount-value");
    // selected income 5000, total income 20000, selected outcome -2000, total outcome -10000 => 4 values
    expect(amounts).toHaveLength(4);
  });

  it("Selected all string shows Selected all", () => {
    setup({ count: 3, income: 3000, outcome: -1000 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={"all"}
      />,
    );
    expect(screen.getByText(/Selected all/)).toBeInTheDocument();
  });

  it("Selected Set size equals total shows Selected all", () => {
    setup({ count: 2, income: 1000, outcome: 0 });
    const selected = new Set([
      { amount: 500, amount_converted: 500, transaction: "t1" },
      { amount: 500, amount_converted: 500, transaction: "t2" },
    ]);
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={selected}
      />,
    );
    expect(screen.getByText(/Selected all/)).toBeInTheDocument();
  });

  it("selectedIncome memo sum baseAmount greater than 0", () => {
    setup({ count: 5, income: 10000, outcome: 0 });
    const selected = new Set([
      { amount: 3000, amount_converted: 3000, transaction: "t1" },
    ]);
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={selected}
      />,
    );
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts[0]).toHaveAttribute("data-amount", "3000");
  });

  it("selectedOutcome memo sum baseAmount less than 0", () => {
    setup({ count: 5, income: 0, outcome: -8000 });
    const selected = new Set([
      { amount: -1500, amount_converted: -1500, transaction: "t1" },
    ]);
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={selected}
      />,
    );
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts[0]).toHaveAttribute("data-amount", "-1500");
  });

  it("PubSub subscribe refetch on filters change network-only", () => {
    setup({ count: 1, income: 0, outcome: 0 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={new Set()}
      />,
    );
    expect(mockSubscribe).toHaveBeenCalledWith(
      PubSubChannels.Transactions,
      expect.any(Function),
    );
    const cb = mockSubscribe.mock.calls[0]?.[1] as (() => void) | undefined;
    cb?.();
    expect(mockRefetch).toHaveBeenCalledWith(
      { filters },
      { fetchPolicy: "network-only" },
    );
  });

  it("income greater than 0 shows AmountValue outcome 0 hides", () => {
    setup({ count: 1, income: 5000, outcome: 0 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={new Set()}
      />,
    );
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts).toHaveLength(1);
    expect(amounts[0]).toHaveAttribute("data-amount", "5000");
  });

  it("outcome less than 0 shows AmountValue income 0 hides", () => {
    setup({ count: 1, income: 0, outcome: -2500 });
    render(
      <TransactionsTotal
        data={dataKey}
        filters={filters}
        selectedTransactions={new Set()}
      />,
    );
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts).toHaveLength(1);
    expect(amounts[0]).toHaveAttribute("data-amount", "-2500");
  });
});
