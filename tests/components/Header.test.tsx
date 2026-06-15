import Header, { PageType } from "@/components/Header";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Header", () => {
  it("renders 5 navigation links for all PageType values and asserts count 5", () => {
    render(<Header active={PageType.Transactions} />);

    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Balances")).toBeInTheDocument();
    expect(screen.getByText("Shares")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Currencies")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /^(Transactions|Balances|Shares|Dashboard|Currencies)$/,
      ),
    ).toHaveLength(5);
  });

  it("renders 5 navigation links in correct order and asserts count 5", () => {
    const { container } = render(<Header active={PageType.Transactions} />);
    const nav = container.querySelector("nav");
    const order = Array.from(nav!.querySelectorAll("a, span")).map(
      (el) => el.textContent,
    );
    expect(order).toEqual([
      "Transactions",
      "Balances",
      "Shares",
      "Dashboard",
      "Currencies",
    ]);
    expect(order).toHaveLength(5);
  });

  it("highlights active page correctly with aria-current page", () => {
    render(<Header active={PageType.Dashboard} />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("only active page has aria-current page", () => {
    render(<Header active={PageType.Transactions} />);
    const transactionsLink = screen.getByText("Transactions").closest("a");
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const currenciesLink = screen.getByText("Currencies").closest("a");
    expect(transactionsLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLink).not.toHaveAttribute("aria-current");
    expect(currenciesLink).not.toHaveAttribute("aria-current");
  });

  it("inactive pages lack aria-current", () => {
    render(<Header active={PageType.Transactions} />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).not.toHaveAttribute("aria-current");
    const currenciesLink = screen.getByText("Currencies").closest("a");
    expect(currenciesLink).not.toHaveAttribute("aria-current");
  });

  it("active page has data-active true on parent div", () => {
    render(<Header active={PageType.Currencies} />);

    const currenciesDiv = screen
      .getByText("Currencies")
      .closest("div[data-active]");
    expect(currenciesDiv).toHaveAttribute("data-active", "true");
  });

  it("links have correct href attributes", () => {
    render(<Header active={PageType.Transactions} />);

    const transactionsLink = screen.getByText("Transactions").closest("a");
    expect(transactionsLink).toHaveAttribute("href", "/transactions");

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const currenciesLink = screen.getByText("Currencies").closest("a");
    expect(currenciesLink).toHaveAttribute("href", "/currencies");

    // Disabled links render as span, not a
    const balancesSpan = screen.getByText("Balances").closest("span");
    expect(balancesSpan).toBeInTheDocument();
    expect(balancesSpan!.tagName).toBe("SPAN");
    const sharesSpan = screen.getByText("Shares").closest("span");
    expect(sharesSpan).toBeInTheDocument();
    expect(sharesSpan!.tagName).toBe("SPAN");
  });

  it("renders disabled pages as spans with muted styling", () => {
    render(<Header active={PageType.Transactions} />);

    const balancesSpan = screen.getByText("Balances").closest("span");
    expect(balancesSpan).toHaveClass("text-muted");
    expect(balancesSpan).toHaveClass("cursor-not-allowed");

    const sharesSpan = screen.getByText("Shares").closest("span");
    expect(sharesSpan).toHaveClass("text-muted");
    expect(sharesSpan).toHaveClass("cursor-not-allowed");
  });

  it("renders with correct styling header border and nav flex gap", () => {
    const { container } = render(<Header active={PageType.Transactions} />);

    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("border-b");

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("flex");
    expect(nav).toHaveClass("gap-4");
  });
});
