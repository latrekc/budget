import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import CategoryChip2 from "@/components/Categories/CategoryChip2";
import { Currency } from "@/lib/types";

describe("CategoryChip2", () => {
  it("renders null when category is null", () => {
    const { container } = render(<CategoryChip2 categories={[null]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single category chip", () => {
    render(<CategoryChip2 categories={[{ color: "#ff0000", name: "Food" }]} />);
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("renders category with amount and currency", () => {
    render(
      <CategoryChip2
        amount={12345}
        categories={[{ color: "#ff0000", name: "Food" }]}
        currency={Currency.GBP}
      />,
    );
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("£123.45")).toBeInTheDocument();
  });

  it("renders nested chips for parent and child", () => {
    render(
      <CategoryChip2
        categories={[
          { color: "#ff0000", name: "Groceries" },
          { color: "#00ff00", name: "Food" },
        ]}
      />,
    );
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders triple nested chips for grandparent, parent, and child", () => {
    render(
      <CategoryChip2
        categories={[
          { color: "#ff0000", name: "Supermarket" },
          { color: "#00ff00", name: "Groceries" },
          { color: "#0000ff", name: "Food" },
        ]}
      />,
    );
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Supermarket")).toBeInTheDocument();
  });

  it("renders only leaf when onlyLeaf is true", () => {
    render(
      <CategoryChip2
        categories={[
          { color: "#ff0000", name: "Groceries" },
          { color: "#00ff00", name: "Food" },
        ]}
        onlyLeaf={true}
      />,
    );
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Food")).not.toBeInTheDocument();
  });

  it("renders ignore icon when ignore is true", () => {
    const { container } = render(
      <CategoryChip2
        categories={[{ color: "#ff0000", name: "Food" }]}
        ignore={true}
      />,
    );
    // BiHide icon should be rendered
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders delete button when onDelete is provided", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <CategoryChip2
        categories={[{ color: "#ff0000", name: "Food" }]}
        onDelete={onDelete}
      />,
    );
    const deleteButton = container.querySelector(
      'button[title="Remove category"]',
    );
    expect(deleteButton).toBeInTheDocument();
  });

  it("disables delete button when isDisabledDelete is true", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <CategoryChip2
        categories={[{ color: "#ff0000", name: "Food" }]}
        isDisabledDelete={true}
        onDelete={onDelete}
      />,
    );
    const deleteButton = container.querySelector(
      'button[title="Remove category"]',
    );
    expect(deleteButton).toBeDisabled();
  });

  it("applies correct background color", () => {
    const { container } = render(
      <CategoryChip2 categories={[{ color: "#ff0000", name: "Food" }]} />,
    );
    const chip = container.querySelector('div[style*="background-color"]');
    expect(chip).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  it("applies black text for light colors", () => {
    const { container } = render(
      <CategoryChip2 categories={[{ color: "#ffffff", name: "Food" }]} />,
    );
    const chip = container.querySelector('div[style*="color"]');
    expect(chip).toHaveStyle({ color: "rgb(0, 0, 0)" });
  });

  it("applies white text for dark colors", () => {
    const { container } = render(
      <CategoryChip2 categories={[{ color: "#000000", name: "Food" }]} />,
    );
    const chip = container.querySelector('div[style*="color"]');
    expect(chip).toHaveStyle({ color: "rgb(255, 255, 255)" });
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = jest.fn();
    const { container } = render(
      <CategoryChip2
        categories={[{ color: "#ff0000", name: "Food" }]}
        onDelete={onDelete}
      />,
    );
    const deleteButton = container.querySelector(
      'button[title="Remove category"]',
    );
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders AmountValue in white pill when amount and currency provided", () => {
    const { container } = render(
      <CategoryChip2
        amount={12345}
        categories={[{ color: "#ff0000", name: "Food" }]}
        currency={Currency.GBP}
      />,
    );
    expect(screen.getByText("£123.45")).toBeInTheDocument();
    const pill = container.querySelector(".bg-white");
    expect(pill).toBeInTheDocument();
  });
});
