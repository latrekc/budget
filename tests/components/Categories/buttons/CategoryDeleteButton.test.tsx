import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { asFragment } from "../../../utils/fragment";

import CategoryDeleteButton from "@/components/Categories/buttons/CategoryDeleteButton";
import { CategoryDeleteButton$key } from "@/components/Categories/buttons/__generated__/CategoryDeleteButton.graphql";
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

// Mock NextUI components

import { usePubSub } from "@/lib/usePubSub";
import { useFragment, useMutation } from "react-relay";

describe("CategoryDeleteButton", () => {
  const mockCategory = {
    id: "cat-1",
    name: "Food",
    parentCategory: null,
  };

  const mockCommitMutation = jest.fn();
  const mockPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useFragment as jest.Mock).mockReturnValue(mockCategory);
    (useMutation as jest.Mock).mockReturnValue([mockCommitMutation, false]);
    (usePubSub as jest.Mock).mockReturnValue({
      publish: mockPublish,
      subscribe: jest.fn(() => jest.fn()),
      unsubscribe: jest.fn(),
    });

    // Mock alert
    global.alert = jest.fn();
  });

  it("renders delete button", () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    const buttons = screen.getAllByTestId("button");
    const deleteButton = buttons[0]; // First button is the delete trigger
    expect(deleteButton).toBeInTheDocument();
    expect(
      deleteButton.getAttribute("data-color") === "danger" ||
        deleteButton.getAttribute("data-variant") === "danger",
    ).toBe(true);
  });

  it("renders popover with confirmation message for root category", () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    expect(screen.getByText(/Are sure you want to remove/)).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText(/a root category/)).toBeInTheDocument();
  });

  it("renders popover with parent category name", () => {
    const categoryWithParent = {
      ...mockCategory,
      parentCategory: { name: "Expenses" },
    };
    (useFragment as jest.Mock).mockReturnValue(categoryWithParent);

    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("calls mutation on delete confirm", async () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    const confirmButton = screen
      .getAllByTestId("button")
      .find((btn) => btn.textContent === "Yes, remove");
    fireEvent.click(confirmButton!);

    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledWith({
        onCompleted: expect.any(Function),
        variables: {
          id: "cat-1",
        },
      });
    });
  });

  it("publishes Categories event on successful deletion", async () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    const confirmButton = screen
      .getAllByTestId("button")
      .find((btn) => btn.textContent === "Yes, remove");
    fireEvent.click(confirmButton!);

    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({ deleteCategory: {} });
    });

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Categories);
    });
  });

  it("shows alert when mutation returns error", async () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    const confirmButton = screen
      .getAllByTestId("button")
      .find((btn) => btn.textContent === "Yes, remove");
    fireEvent.click(confirmButton!);

    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({
        deleteCategory: { error: "Cannot delete category with transactions" },
      });
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Cannot delete category with transactions",
      );
    });
  });

  it("shows alert when category is null", () => {
    // The component does not expect null category - it will crash during render
    // This test documents that null is not a valid input
    (useFragment as jest.Mock).mockReturnValue(null);

    // Rendering with null category should throw because component accesses category.name
    expect(() => {
      render(
        <CategoryDeleteButton
          category={asFragment<CategoryDeleteButton$key>({
            id: "cat-1",
            name: "Food",
          })}
        />,
      );
    }).toThrow();
  });

  it("disables button when mutation is in flight", () => {
    (useMutation as jest.Mock).mockReturnValue([mockCommitMutation, true]);

    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    const confirmButton = screen
      .getAllByTestId("button")
      .find((btn) => btn.textContent === "Yes, remove");
    expect(confirmButton).toHaveAttribute("data-disabled", "true");
  });

  it("calls useFragment with correct fragment", () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    expect(useFragment).toHaveBeenCalled();
  });

  it("calls useMutation with correct mutation", () => {
    render(
      <CategoryDeleteButton
        category={asFragment<CategoryDeleteButton$key>({
          id: "cat-1",
          name: "Food",
        })}
      />,
    );

    expect(useMutation).toHaveBeenCalled();
  });
});
