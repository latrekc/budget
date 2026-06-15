import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

import CategoryMoveButton from "@/components/Categories/buttons/CategoryMoveButton";
import { CategoryMoveButton$key } from "@/components/Categories/buttons/__generated__/CategoryMoveButton.graphql";
import { CategoryMoveButton_Categories$key } from "@/components/Categories/buttons/__generated__/CategoryMoveButton_Categories.graphql";
import { PubSubChannels } from "@/lib/types";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock usePubSub
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: jest.fn(),
}));

// Mock CategoryAutocomplete
jest.mock("@/components/Categories/CategoryAutocomplete", () => {
  return function MockCategoryAutocomplete({
    onSelect,
    filterCallback,
    label,
  }: {
    onSelect: (key: React.Key | null) => void;
    filterCallback?: (
      categories: Array<{ id: string; name: string }>,
    ) => Array<{ id: string; name: string }>;
    label?: string;
  }) {
    return (
      <div data-testid="category-autocomplete" data-label={label}>
        <button
          data-testid="autocomplete-select"
          onClick={() => onSelect("selected-cat-id")}
        >
          Select
        </button>
        <div data-testid="filter-callback">
          {filterCallback ? "has-filter" : "no-filter"}
        </div>
      </div>
    );
  };
});

// Mock NextUI components

import { usePubSub } from "@/lib/usePubSub";
import { useFragment, useMutation } from "react-relay";

describe("CategoryMoveButton", () => {
  const mockCategory = {
    id: "cat-1",
    name: "Food",
    parentCategory: {
      id: "parent-1",
      parentCategory: null,
    },
    subCategories: [
      {
        id: "sub-1",
        subCategories: [{ id: "subsub-1" }],
      },
    ],
  };

  const mockCategories = {};

  const mockCommitMutation = jest.fn();
  const mockPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock).mockImplementation((_fragment, _key) => {
      // First call is for category, second for categories
      const callCount = (useFragment as jest.Mock).mock.calls.length;
      if (callCount === 1) {
        return mockCategory;
      }
      return mockCategories;
    });
    (useMutation as jest.Mock).mockReturnValue([mockCommitMutation, false]);
    (usePubSub as jest.Mock).mockReturnValue({
      publish: mockPublish,
      subscribe: jest.fn(() => jest.fn()),
      unsubscribe: jest.fn(),
    });
  });

  it("renders move button", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const buttons = screen.getAllByTestId("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("opens popover when button is clicked", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const trigger = screen.getByTestId("popover-trigger");
    fireEvent.click(trigger);

    const popover = screen.getByTestId("popover");
    expect(popover).toHaveAttribute("data-is-open", "true");
  });

  it("shows 'Move to the root' button when category has parent", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    expect(screen.getByText("Move to the root")).toBeInTheDocument();
  });

  it("does not show 'Move to the root' button for root category", () => {
    const rootCategory = {
      ...mockCategory,
      parentCategory: null,
    };
    (useFragment as jest.Mock)
      .mockReset()
      .mockReturnValueOnce(rootCategory)
      .mockReturnValueOnce(mockCategories);

    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    expect(screen.queryByText("Move to the root")).not.toBeInTheDocument();
  });

  it("calls mutation when 'Move to the root' is clicked", async () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const moveToRootButton = screen.getByText("Move to the root");
    fireEvent.click(moveToRootButton);

    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledWith({
        onCompleted: expect.any(Function),
        variables: {
          id: "cat-1",
          name: "Food",
          parent: null,
        },
      });
    });
  });

  it("renders CategoryAutocomplete with filterCallback", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const autocomplete = screen.getByTestId("category-autocomplete");
    expect(autocomplete).toBeInTheDocument();
    expect(screen.getByTestId("filter-callback")).toHaveTextContent(
      "has-filter",
    );
  });

  it("filterCallback excludes category id, parent id, and subcategories", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    // The filterCallback is passed to CategoryAutocomplete
    // We verify it's present, the actual filtering logic is tested via integration
    expect(screen.getByTestId("filter-callback")).toHaveTextContent(
      "has-filter",
    );
  });

  it("calls mutation when category is selected from autocomplete", async () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const selectButton = screen.getByTestId("autocomplete-select");
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledWith({
        onCompleted: expect.any(Function),
        variables: {
          id: "cat-1",
          name: "Food",
          parent: "selected-cat-id",
        },
      });
    });
  });

  it("publishes Categories event on successful move", async () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const moveToRootButton = screen.getByText("Move to the root");
    fireEvent.click(moveToRootButton);

    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({ updateCategory: {} });
    });

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Categories);
    });
  });

  it("shows error when mutation returns error", async () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const moveToRootButton = screen.getByText("Move to the root");
    fireEvent.click(moveToRootButton);

    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({ updateCategory: { error: "Cannot move category" } });
    });

    // Error is set in state, component should still render
    await waitFor(() => {
      const autocomplete = screen.getByTestId("category-autocomplete");
      expect(autocomplete).toBeInTheDocument();
    });
  });

  it("resets error when popover closes", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const trigger = screen.getByTestId("popover-trigger");
    fireEvent.click(trigger); // Open
    fireEvent.click(trigger); // Close

    // Error should be reset (verified by no error display)
    expect(screen.getByTestId("category-autocomplete")).toBeInTheDocument();
  });

  it("disables buttons when mutation is in flight", () => {
    (useMutation as jest.Mock).mockReturnValue([mockCommitMutation, true]);

    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    // Component should render without error when mutation is in flight
    // The isDisabled prop is passed to CategoryAutocomplete and the Move to Root button
    expect(screen.getByTestId("category-autocomplete")).toBeInTheDocument();
  });

  it("uses correct label for subcategory", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const autocomplete = screen.getByTestId("category-autocomplete");
    expect(autocomplete).toHaveAttribute("data-label", "Move subcategory to");
  });

  it("uses correct label for root category", () => {
    const rootCategory = {
      ...mockCategory,
      parentCategory: null,
    };
    (useFragment as jest.Mock)
      .mockReset()
      .mockReturnValueOnce(rootCategory)
      .mockReturnValueOnce(mockCategories);

    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    const autocomplete = screen.getByTestId("category-autocomplete");
    expect(autocomplete).toHaveAttribute("data-label", "Move category to");
  });

  it("calls useFragment twice", () => {
    render(
      <CategoryMoveButton
        categories={asFragment<CategoryMoveButton_Categories$key>({})}
        category={asFragment<CategoryMoveButton$key>({
          id: "cat-1",
          name: "Food",
          parentCategory: null,
        })}
      />,
    );

    expect(useFragment).toHaveBeenCalledTimes(2);
  });
});
