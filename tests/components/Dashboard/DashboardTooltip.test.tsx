import { DashboardTooltip } from "@/components/Dashboard/DashboardTooltip";
import { DEFAULT_CURRENCY } from "@/lib/types";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
jest.mock("@/components/AmountValue", () => {
  const React = jest.requireActual("react") as typeof import("react");
  type Props = { amount: number; currency: string };
  const AmountValue = ({ amount, currency }: Props) =>
    React.createElement(
      "span",
      { "data-testid": "amount-value" },
      `${currency}:${amount}`,
    );
  AmountValue.displayName = "AmountValue";
  return {
    __esModule: true,
    default: AmountValue,
    Size: { Small: 0, Normal: 1, Big: 2 },
  };
});
jest.mock("@/components/Categories/CategoryChip2", () => {
  const React = jest.requireActual("react") as typeof import("react");
  type Props = { amount?: number; categories: unknown[]; currency?: string };
  return {
    __esModule: true,
    default: ({ amount, categories, currency }: Props) =>
      React.createElement(
        "div",
        { "data-testid": "category-chip2" },
        `chip:${(categories || []).filter(Boolean).length}:${currency}:${amount}`,
      ),
  };
});

describe("DashboardTooltip", () => {
  const baseCategory = { color: "#ff0000", name: "Food" };
  const parentCategory = { color: "#00ff00", name: "Expenses" };
  const grandParent = { color: "#0000ff", name: "Root" };
  it("aggregates rows per month income outcome total sum and renders 3 rows table and asserts count 3", () => {
    const data: [string, number | null][] = [
      ["2024-01", 10000],
      ["2024-01", -5000],
      ["2024-02", 20000],
      ["2024-02", -8000],
      ["2024-03", 0],
    ];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(3);
    expect(screen.getByText("January 2024")).toBeInTheDocument();
    expect(screen.getByText("February 2024")).toBeInTheDocument();
    expect(screen.getByText("March 2024")).toBeInTheDocument();
    const amounts = screen.getAllByTestId("amount-value");
    expect(amounts).toHaveLength(6);
  });
  it("renders CategoryChip2 with total amount DEFAULT_CURRENCY and asserts chip count 1", () => {
    const data: [string, number | null][] = [
      ["2024-01", 15000],
      ["2024-02", -7000],
    ];
    render(
      <DashboardTooltip
        category={baseCategory}
        data={data}
        grandParentCategory={grandParent}
        parentCategory={parentCategory}
      />,
    );
    const chip = screen.getByTestId("category-chip2");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("chip:3");
    expect(chip).toHaveTextContent(DEFAULT_CURRENCY);
    expect(chip).toHaveTextContent("8000");
    expect(screen.getAllByTestId("category-chip2")).toHaveLength(1);
  });
  it("table with month formatted via monthNames AmountValue size Small Big and asserts 4 columns header", () => {
    const data: [string, number | null][] = [["2024-05", 12345]];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    const headers = screen.getAllByText(/Name|Income|Outcome|Saldo/);
    expect(headers).toHaveLength(4);
    expect(screen.getByText("May 2024")).toBeInTheDocument();
    expect(screen.getAllByText("GBP:12345")).toHaveLength(2);
  });
  it("scroll shadow max-h 400 class present", () => {
    const data: [string, number | null][] = [["2024-01", 100]];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    const scroll = screen.getByTestId("scroll-shadow");
    expect(scroll).toHaveClass("max-h-[400px]");
  });
  it("renders dashes for zero income outcome saldo and asserts 0 amount-value in that row", () => {
    const data: [string, number | null][] = [["2024-06", 0]];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    const row = screen.getByText("June 2024").closest("tr");
    expect(row).toBeInTheDocument();
    const dashes = within(row as HTMLElement).getAllByText("—");
    expect(dashes).toHaveLength(3);
    expect(screen.queryAllByTestId("amount-value")).toHaveLength(0);
  });
  it("aggregates multiple entries same month correctly and asserts 1 row count", () => {
    const data: [string, number | null][] = [
      ["2024-07", 5000],
      ["2024-07", 3000],
      ["2024-07", -2000],
      ["2024-07", -1000],
    ];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    expect(screen.getAllByTestId("table-row")).toHaveLength(1);
    expect(screen.getByText("July 2024")).toBeInTheDocument();
    expect(screen.getAllByTestId("amount-value")).toHaveLength(3);
  });
  it("handles null amounts gracefully and asserts 0 amount-value", () => {
    const data: [string, number | null][] = [
      ["2024-08", null],
      ["2024-08", null],
    ];
    render(<DashboardTooltip category={baseCategory} data={data} />);
    expect(screen.getAllByTestId("table-row")).toHaveLength(1);
    expect(screen.getAllByText("—")).toHaveLength(3);
    expect(screen.queryAllByTestId("amount-value")).toHaveLength(0);
  });
  it("renders with current prop selectedKeys and asserts table present", () => {
    const data: [string, number | null][] = [["2024-09", 1000]];
    render(
      <DashboardTooltip
        category={baseCategory}
        current="2024-09"
        data={data}
      />,
    );
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText("September 2024")).toBeInTheDocument();
  });
});
