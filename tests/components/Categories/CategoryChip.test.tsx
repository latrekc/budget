import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import CategoryChip from "@/components/Categories/CategoryChip";
import { CategoryChip$key } from "@/components/Categories/__generated__/CategoryChip.graphql";
import { Currency } from "@/lib/types";
import { asFragment } from "../../utils/fragment";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
}));

import { useFragment } from "react-relay";

describe("CategoryChip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders category chip with Relay fragment data", () => {
    const mockCategory = {
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
        currency={Currency.GBP}
        amount={12345}
      />,
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("£123.45")).toBeInTheDocument();
  });

  it("passes parent category to CategoryChip2", () => {
    const mockCategory = {
      name: "Groceries",
      color: "#ff0000",
      parentCategory: {
        name: "Food",
        color: "#00ff00",
        parentCategory: null,
      },
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("passes grandparent category to CategoryChip2", () => {
    const mockCategory = {
      name: "Supermarket",
      color: "#ff0000",
      parentCategory: {
        name: "Groceries",
        color: "#00ff00",
        parentCategory: {
          name: "Food",
          color: "#0000ff",
        },
      },
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    expect(screen.getByText("Supermarket")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("passes ignore prop to CategoryChip2", () => {
    const mockCategory = {
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    const { container } = render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
        ignore={true}
      />,
    );

    // BiHide icon should be present
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("passes onDelete handler to CategoryChip2", () => {
    const mockCategory = {
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    const onDelete = jest.fn();
    const { container } = render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
        onDelete={onDelete}
      />,
    );

    const deleteButton = container.querySelector(
      'button[title="Remove category"]',
    );
    expect(deleteButton).toBeInTheDocument();
  });

  it("passes isDisabledDelete to CategoryChip2", () => {
    const mockCategory = {
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    const onDelete = jest.fn();
    const { container } = render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
        onDelete={onDelete}
        isDisabledDelete={true}
      />,
    );

    const deleteButton = container.querySelector(
      'button[title="Remove category"]',
    );
    expect(deleteButton).toBeDisabled();
  });

  it("passes onlyLeaf prop to CategoryChip2", () => {
    const mockCategory = {
      name: "Groceries",
      color: "#ff0000",
      parentCategory: {
        name: "Food",
        color: "#00ff00",
        parentCategory: null,
      },
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    render(
      <CategoryChip
        category={asFragment<CategoryChip$key>({
          color: "blue",
          name: "Food",
          parentCategory: null,
        })}
        onlyLeaf={true}
      />,
    );

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Food")).not.toBeInTheDocument();
  });

  it("calls useFragment with correct fragment", () => {
    const mockCategory = {
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    };

    (useFragment as jest.Mock).mockReturnValue(mockCategory);

    const categoryKey = asFragment<CategoryChip$key>({ id: "test-id" });
    render(<CategoryChip category={categoryKey} />);

    expect(useFragment).toHaveBeenCalled();
  });
});
