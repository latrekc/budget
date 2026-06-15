import TransactionsTable, {
  PER_PAGE,
} from "@/components/Transactions/TransactionsTable";
import { TransactionsTable$key } from "@/components/Transactions/__generated__/TransactionsTable.graphql";
import { TransactionsTable_Categories$key } from "@/components/Transactions/__generated__/TransactionsTable_Categories.graphql";
import { PubSubChannels } from "@/lib/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { asFragment } from "../../utils/fragment";

const mockRefetch: jest.Mock = jest.fn();
const mockLoadNext = jest.fn();
const mockSubscribe: jest.Mock = jest.fn(() => jest.fn());
const mockUseFragment: jest.Mock = jest.fn((_: unknown, key) => key);

jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: (...args: unknown[]) => (mockUseFragment as jest.Mock)(...args),
  usePaginationFragment: jest.fn(),
}));

jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    subscribe: (...args: unknown[]) => (mockSubscribe as jest.Mock)(...args),
  }),
}));

jest.mock(
  "@/components/Transactions/cell/TransactionDescriptionCell",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "desc-cell" }),
);
jest.mock(
  "@/components/Transactions/cell/TransactionAmountCell",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "amount-cell" }),
);
jest.mock(
  "@/components/Transactions/cell/TransactionSourceCell",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "source-cell" }),
);
jest.mock(
  "@/components/Transactions/cell/TransactionCategoriesCell",
  () => () =>
    jest
      .requireActual("react")
      .createElement("div", { "data-testid": "categories-cell" }),
);
jest.mock(
  "@/components/Transactions/cell/TransactionCategoriesButtonCell",
  () => () =>
    jest.requireActual("react").createElement("div", {
      "data-testid": "categories-button-cell",
    }),
);

import { usePaginationFragment } from "react-relay";

describe("TransactionsTable", () => {
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
  const categoriesKey = asFragment<TransactionsTable_Categories$key>({});
  const transactionsKey = asFragment<TransactionsTable$key>({});

  const setupPagination = (
    edges: unknown[],
    hasNext = false,
    isLoadingNext = false,
  ) => {
    (usePaginationFragment as jest.Mock).mockReturnValue({
      data: {
        transactions: {
          edges,
          pageInfo: { endCursor: "c", hasNextPage: hasNext },
        },
      },
      hasNext,
      isLoadingNext,
      loadNext: mockLoadNext,
      refetch: mockRefetch,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("0 items TableBody emptyContent No records and asserts count 0", () => {
    setupPagination([]);
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    expect(screen.getByTestId("empty")).toHaveTextContent("No records");
    expect(screen.queryAllByTestId("table-row")).toHaveLength(0);
  });

  it("X items flat list renders Table columns and maps edges to TableRow and asserts 2 rows", () => {
    setupPagination([
      {
        node: {
          amount: 1000,
          amount_converted: 1000,
          completed: true,
          id: "tx1",
        },
      },
      {
        node: {
          amount: -500,
          amount_converted: -500,
          completed: false,
          id: "tx2",
        },
      },
    ]);
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    const columns = screen.getAllByTestId("table-column");
    expect(columns.length).toBeGreaterThanOrEqual(6);
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].className).toContain("bg-white");
    expect(rows[1].className).toContain("bg-lime-50");
  });

  it("Pagination PER_PAGE 20 renders idle LoadMore sentinel when hasNext", () => {
    setupPagination(
      [{ node: { amount: 1, amount_converted: 1, completed: true, id: "a" } }],
      true,
      false,
    );
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    expect(screen.getByTestId("table-load-more")).toHaveAttribute(
      "data-is-loading",
      "false",
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(PER_PAGE).toBe(20);
  });

  it("Loading next shows Spinner in LoadMore sentinel when isLoadingNext", () => {
    setupPagination(
      [{ node: { amount: 1, amount_converted: 1, completed: true, id: "a" } }],
      false,
      true,
    );
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    expect(screen.getByTestId("table-load-more")).toHaveAttribute(
      "data-is-loading",
      "true",
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("Filtering useEffect subscribes PubSubChannels Transactions refetch network-only", () => {
    setupPagination([]);
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
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

  it("Selection mode multiple selectedKeys derived and onSelectionChange maps to Set objects", () => {
    setupPagination([
      {
        node: {
          amount: 1000,
          amount_converted: 1100,
          completed: true,
          id: "tx1",
        },
      },
    ]);
    const setSelected = jest.fn();
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={setSelected}
        transactions={transactionsKey}
      />,
    );
    fireEvent.click(screen.getByTestId("table"));
    expect(setSelected).toHaveBeenCalled();
    const arg = setSelected.mock.calls[0][0];
    expect(arg instanceof Set).toBe(true);
    const first = [...arg][0];
    expect(first).toMatchObject({
      amount: 1000,
      amount_converted: 1100,
      transaction: "tx1",
    });
  });

  it("Row completed true bg-white hover bg-stone-100 completed false bg-lime-50", () => {
    setupPagination([
      { node: { amount: 10, amount_converted: 10, completed: true, id: "1" } },
      { node: { amount: 20, amount_converted: 20, completed: false, id: "2" } },
    ]);
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    const rows = screen.getAllByTestId("table-row");
    expect(rows[0].className).toContain("bg-white");
    expect(rows[1].className).toContain("bg-lime-50");
  });

  it("Cell alignment mapping text-left text-right justify-center preserved", () => {
    setupPagination([
      { node: { amount: 1, amount_converted: 1, completed: true, id: "a" } },
    ]);
    render(
      <TransactionsTable
        categories={categoriesKey}
        filters={filters}
        selectedTransactions={new Set()}
        setSelectedTransactions={jest.fn()}
        transactions={transactionsKey}
      />,
    );
    const cells = screen.getAllByTestId("table-cell");
    const classes = cells.map((c) => c.className).join(" ");
    expect(classes).toMatch(/text-left/);
    expect(classes).toMatch(/text-right/);
    expect(classes).toMatch(/justify-center/);
  });
});
