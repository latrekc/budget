import SourceImage from "@/components/SourceImage";
import type { Source } from "@/components/Transactions/cell/__generated__/TransactionSourceCell.graphql";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

type ImageProps = {
  alt?: string;
  className?: string;
  fill?: boolean;
  height?: number;
  width?: number;
  src?: string;
  priority?: boolean;
};

jest.mock("next/image", () => (props: ImageProps) => {
  const React = jest.requireActual("react") as typeof import("react");
  return React.createElement("img", {
    alt: props.alt,
    className: props.className,
    "data-fill": props.fill ? "true" : "false",
    height: props.height,
    width: props.width,
    src: props.src,
    "data-priority": props.priority ? "true" : "false",
  });
});

describe("SourceImage", () => {
  it("renders source/bank logo images", () => {
    const { container } = render(<SourceImage source={"Barclays" as Source} />);

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Barclays");
  });

  it("documents current no-fallback behavior for HSBC", () => {
    // Source component does not implement fallback logic; test characterizes current rendering behavior explicitly.
    const { container } = render(<SourceImage source={"HSBC" as Source} />);

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "HSBC");
  });

  it("sizes the icon via a 24px (size-6) contained wrapper", () => {
    const { container } = render(<SourceImage source={"Monzo" as Source} />);

    const wrapper = container.querySelector("span");
    expect(wrapper).toHaveClass("size-6");
    expect(wrapper).toHaveClass("relative");

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("data-fill", "true");
    expect(img).toHaveClass("object-contain");
  });

  it("has correct src path", () => {
    const { container } = render(<SourceImage source={"Revolut" as Source} />);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/assets/sources/Revolut.svg");
  });

  it("renders with priority flag", () => {
    const { container } = render(<SourceImage source={"Wise" as Source} />);

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("data-priority", "true");
  });

  it("passes alt, src, priority and fill props to Next Image", () => {
    const { container } = render(<SourceImage source={"Tinkoff" as Source} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "Tinkoff");
    expect(img).toHaveAttribute("src", "/assets/sources/Tinkoff.svg");
    expect(img).toHaveAttribute("data-fill", "true");
    expect(img).toHaveAttribute("data-priority", "true");
  });

  it("renders for all source types", () => {
    const sources = [
      "Barclays",
      "HSBC",
      "Monzo",
      "Raiffeisen",
      "Revolut",
      "Sberbank",
      "Tinkoff",
      "Wise",
    ] as Source[];

    sources.forEach((source) => {
      const { container } = render(<SourceImage source={source} />);
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", source);
      expect(img).toHaveAttribute("src", `/assets/sources/${source}.svg`);
    });
  });
});
