import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

import CategoryButtons from "@/components/Categories/buttons/CategoryButtons";
import { CategoryButtons$key } from "@/components/Categories/buttons/__generated__/CategoryButtons.graphql";
import { CategoryButtons_Categories$key } from "@/components/Categories/buttons/__generated__/CategoryButtons_Categories.graphql";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
}));

// Mock child button components
jest.mock("@/components/Categories/buttons/CategoryAddButton", () => {
  return function MockCategoryAddButton({ parent }: { parent?: string }) {
    return <div data-testid="category-add-button" data-parent={parent} />;
  };
});

jest.mock("@/components/Categories/buttons/CategoryEditButton", () => {
  return function MockCategoryEditButton() {
    return <div data-testid="category-edit-button" />;
  };
});

jest.mock("@/components/Categories/buttons/CategoryMoveButton", () => {
  return function MockCategoryMoveButton() {
    return <div data-testid="category-move-button" />;
  };
});

jest.mock("@/components/Categories/buttons/CategoryDeleteButton", () => {
  return function MockCategoryDeleteButton() {
    return <div data-testid="category-delete-button" />;
  };
});

// Mock NextUI ButtonGroup

import { useFragment } from "react-relay";

describe("CategoryButtons", () => {
  const mockCategory = {
    id: "cat-1",
  };

  const mockCategories = {};

  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock)
      .mockReturnValueOnce(mockCategory)
      .mockReturnValueOnce(mockCategories);
  });

  it("renders ButtonGroup", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(screen.getByTestId("button-group")).toBeInTheDocument();
  });

  it("renders CategoryAddButton when withAddButton is true", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
        withAddButton={true}
      />,
    );

    const addButton = screen.getByTestId("category-add-button");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute("data-parent", "cat-1");
  });

  it("does not render CategoryAddButton when withAddButton is false", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
        withAddButton={false}
      />,
    );

    expect(screen.queryByTestId("category-add-button")).not.toBeInTheDocument();
  });

  it("renders CategoryAddButton by default (withAddButton defaults to true)", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(screen.getByTestId("category-add-button")).toBeInTheDocument();
  });

  it("renders CategoryEditButton", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(screen.getByTestId("category-edit-button")).toBeInTheDocument();
  });

  it("renders CategoryMoveButton", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(screen.getByTestId("category-move-button")).toBeInTheDocument();
  });

  it("renders CategoryDeleteButton", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(screen.getByTestId("category-delete-button")).toBeInTheDocument();
  });

  it("renders all buttons in correct order", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
        withAddButton={true}
      />,
    );

    const buttonGroup = screen.getByTestId("button-group");
    const buttons = buttonGroup.children;

    expect(buttons[0]).toHaveAttribute("data-testid", "category-add-button");
    expect(buttons[1]).toHaveAttribute("data-testid", "category-edit-button");
    expect(buttons[2]).toHaveAttribute("data-testid", "category-move-button");
    expect(buttons[3]).toHaveAttribute("data-testid", "category-delete-button");
  });

  it("calls useFragment twice", () => {
    render(
      <CategoryButtons
        categories={asFragment<CategoryButtons_Categories$key>({})}
        category={asFragment<CategoryButtons$key>({ id: "cat-1" })}
      />,
    );

    expect(useFragment).toHaveBeenCalledTimes(2);
  });
});
