import AmountValue, { AmountValueFormat, Size } from "@/components/AmountValue";
import type { Currency } from "@/components/Transactions/cell/__generated__/TransactionAmountCell.graphql";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("AmountValueFormat", () => {
  it("formats amount with currency symbol", () => {
    const result = AmountValueFormat({
      amount: 12345,
      currency: "GBP" as Currency,
    });
    expect(result).toBe("£123.45");
  });

  it("formats amount with USD currency", () => {
    const result = AmountValueFormat({
      amount: 12345,
      currency: "USD" as Currency,
    });
    expect(result).toBe("$123.45");
  });

  it("formats amount with EUR currency", () => {
    const result = AmountValueFormat({
      amount: 12345,
      currency: "EUR" as Currency,
    });
    expect(result).toBe("€123.45");
  });

  it("rounds amount when round is true", () => {
    const result = AmountValueFormat({
      amount: 12345,
      currency: "GBP" as Currency,
      round: true,
    });
    expect(result).toBe("£123");
  });

  it("uses absolute value when abs is true", () => {
    const result = AmountValueFormat({
      amount: -12345,
      currency: "GBP" as Currency,
      abs: true,
    });
    expect(result).toBe("£123.45");
  });

  it("formats negative amount", () => {
    const result = AmountValueFormat({
      amount: -12345,
      currency: "GBP" as Currency,
    });
    expect(result).toBe("-£123.45");
  });

  it("formats zero amount", () => {
    const result = AmountValueFormat({
      amount: 0,
      currency: "GBP" as Currency,
    });
    expect(result).toBe("£0.00");
  });
});

describe("AmountValue", () => {
  it("renders amount with currency symbol", () => {
    render(<AmountValue amount={12345} currency={"GBP" as Currency} />);
    expect(screen.getByText("£123.45")).toBeInTheDocument();
  });

  it("applies green color for positive amounts", () => {
    const { container } = render(
      <AmountValue amount={12345} currency={"GBP" as Currency} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-green-900");
  });

  it("applies red color for negative amounts", () => {
    const { container } = render(
      <AmountValue amount={-12345} currency={"GBP" as Currency} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-red-900");
  });

  it("applies default color for zero amounts", () => {
    const { container } = render(
      <AmountValue amount={0} currency={"GBP" as Currency} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-default-500");
  });

  it("applies default color when secondary is true", () => {
    const { container } = render(
      <AmountValue
        amount={12345}
        currency={"GBP" as Currency}
        secondary={true}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-default-500");
  });

  it("applies small text size", () => {
    const { container } = render(
      <AmountValue
        amount={12345}
        currency={"GBP" as Currency}
        size={Size.Small}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-sm");
  });

  it("applies normal text size by default", () => {
    const { container } = render(
      <AmountValue amount={12345} currency={"GBP" as Currency} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-base");
  });

  it("applies big text size", () => {
    const { container } = render(
      <AmountValue
        amount={12345}
        currency={"GBP" as Currency}
        size={Size.Big}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-lg");
  });

  it("applies monospace font and nowrap", () => {
    const { container } = render(
      <AmountValue amount={12345} currency={"GBP" as Currency} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-mono");
    expect(span).toHaveClass("whitespace-nowrap");
  });

  it("renders rounded amount when round is true", () => {
    render(
      <AmountValue amount={12345} currency={"GBP" as Currency} round={true} />,
    );
    expect(screen.getByText("£123")).toBeInTheDocument();
  });

  it("renders absolute value when abs is true", () => {
    render(
      <AmountValue amount={-12345} currency={"GBP" as Currency} abs={true} />,
    );
    expect(screen.getByText("£123.45")).toBeInTheDocument();
  });

  it("renders amount with USD currency symbol at component level", () => {
    render(<AmountValue amount={12345} currency={"USD" as Currency} />);
    expect(screen.getByText("$123.45")).toBeInTheDocument();
  });

  it("renders amount with EUR currency symbol at component level", () => {
    render(<AmountValue amount={12345} currency={"EUR" as Currency} />);
    expect(screen.getByText("€123.45")).toBeInTheDocument();
  });

  it("applies green color when secondary is false explicitly for positive", () => {
    const { container } = render(
      <AmountValue
        amount={12345}
        currency={"GBP" as Currency}
        secondary={false}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-green-900");
    expect(span).not.toHaveClass("text-default-500");
  });

  it("applies red color when secondary is false explicitly for negative", () => {
    const { container } = render(
      <AmountValue
        amount={-12345}
        currency={"GBP" as Currency}
        secondary={false}
      />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-red-900");
    expect(span).not.toHaveClass("text-default-500");
  });
});
