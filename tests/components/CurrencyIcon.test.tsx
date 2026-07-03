import CurrencyIcon from "@/components/CurrencyIcon";
import { Currency } from "@/lib/types";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

jest.mock("react-icons/pi", () => ({
  PiCurrencyGbpBold: () => <svg data-testid="icon-gbp" />,
  PiCurrencyEurBold: () => <svg data-testid="icon-eur" />,
  PiCurrencyRubBold: () => <svg data-testid="icon-rub" />,
  PiCurrencyDollarBold: () => <svg data-testid="icon-usd" />,
  PiCurrencyJpyBold: () => <svg data-testid="icon-jpy" />,
}));

describe("CurrencyIcon", () => {
  it("renders GBP icon for GBP currency", () => {
    const { container } = render(<CurrencyIcon currency={Currency.GBP} />);
    // The component should render the PiCurrencyGbpBold icon
    expect(
      container.querySelector('[data-testid="icon-gbp"]'),
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders EUR icon for EUR currency", () => {
    const { container } = render(<CurrencyIcon currency={Currency.EUR} />);
    expect(
      container.querySelector('[data-testid="icon-eur"]'),
    ).toBeInTheDocument();
  });

  it("renders RUB icon for RUB currency", () => {
    const { container } = render(<CurrencyIcon currency={Currency.RUB} />);
    expect(
      container.querySelector('[data-testid="icon-rub"]'),
    ).toBeInTheDocument();
  });

  it("renders USD icon for USD currency", () => {
    const { container } = render(<CurrencyIcon currency={Currency.USD} />);
    expect(
      container.querySelector('[data-testid="icon-usd"]'),
    ).toBeInTheDocument();
  });

  it("renders JPY icon for JPY currency", () => {
    const { container } = render(<CurrencyIcon currency={Currency.JPY} />);
    expect(
      container.querySelector('[data-testid="icon-jpy"]'),
    ).toBeInTheDocument();
  });

  it("handles unknown currency codes gracefully", () => {
    // For unknown currencies, it returns Currency[currency] which is the string value
    const { container } = render(
      <CurrencyIcon currency={Currency.HUF as Currency} />,
    );
    expect(container.textContent).toBe("HUF");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("handles TRY currency", () => {
    const { container } = render(
      <CurrencyIcon currency={Currency.TRY as Currency} />,
    );
    expect(container.textContent).toBe("TRY");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies no extra styling by default", () => {
    const { container } = render(<CurrencyIcon currency={Currency.GBP} />);
    const svg = container.querySelector("svg");
    // Source component does not apply classes; verify svg exists without unexpected class attribute or with empty class
    expect(svg).toBeInTheDocument();
    // Characterization: no className applied by CurrencyIcon itself
    expect(svg?.getAttribute("class")).toBeFalsy();
  });
});
