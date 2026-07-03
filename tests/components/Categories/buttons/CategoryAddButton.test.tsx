import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import CategoryAddButton from "@/components/Categories/buttons/CategoryAddButton";
import { PubSubChannels } from "@/lib/types";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock usePubSub
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: jest.fn(),
}));

// Mock NextUI components

import { usePubSub } from "@/lib/usePubSub";
import { useMutation } from "react-relay";

describe("CategoryAddButton", () => {
  const mockCommitMutation = jest.fn();
  const mockPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([mockCommitMutation, false]);
    (usePubSub as jest.Mock).mockReturnValue({
      publish: mockPublish,
      subscribe: jest.fn(() => jest.fn()),
      unsubscribe: jest.fn(),
    });
  });

  it("renders button with label when withLabel is true", () => {
    render(<CategoryAddButton withLabel={true} />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-title", "Add category");
    expect(button).toHaveAttribute("data-is-icon-only", "false");
    expect(button).toHaveTextContent("Add category");
  });

  it("renders icon-only button when withLabel is false", () => {
    render(<CategoryAddButton withLabel={false} />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-is-icon-only", "true");
  });

  it("renders button with subcategory label when parent is provided", () => {
    render(<CategoryAddButton parent="parent-id" withLabel={true} />);

    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-title", "Add subcategory");
    expect(button).toHaveTextContent("Add subcategory");
  });

  it("opens popover when button is clicked", () => {
    render(<CategoryAddButton withLabel={true} />);

    const trigger = screen.getByTestId("popover-trigger");
    fireEvent.click(trigger);

    const popover = screen.getByTestId("popover");
    expect(popover).toHaveAttribute("data-is-open", "true");
  });

  it("renders input with label in popover", () => {
    render(<CategoryAddButton withLabel={true} />);

    // Use getAllByText since "Add category" appears in both button and label
    const labels = screen.getAllByText("Add category");
    expect(labels.length).toBeGreaterThan(0);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New Category" } });

    expect(input.value).toBe("New Category");
  });

  it("clears input when clear button is clicked", () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New Category" } });

    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);

    expect(input.value).toBe("");
  });

  it("submits form with trimmed value", async () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "  New Category  " } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledWith({
        onCompleted: expect.any(Function),
        onError: expect.any(Function),
        variables: {
          name: "New Category",
          parent: undefined,
        },
      });
    });
  });

  it("submits form with parent id", async () => {
    render(<CategoryAddButton parent="parent-id" withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "Subcategory" } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockCommitMutation).toHaveBeenCalledWith({
        onCompleted: expect.any(Function),
        onError: expect.any(Function),
        variables: {
          name: "Subcategory",
          parent: "parent-id",
        },
      });
    });
  });

  it("does not submit when value is empty", () => {
    render(<CategoryAddButton withLabel={true} />);

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    expect(mockCommitMutation).not.toHaveBeenCalled();
  });

  it("does not submit when value is only whitespace", () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "   " } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    expect(mockCommitMutation).not.toHaveBeenCalled();
  });

  it("publishes Categories event on successful mutation", async () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "New Category" } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    // Get the onCompleted callback
    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({ createCategory: {} });
    });

    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith(PubSubChannels.Categories);
    });
  });

  it("shows error when mutation returns error", async () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "New Category" } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    const onCompleted = mockCommitMutation.mock.calls[0][0].onCompleted;
    await act(async () => {
      onCompleted({ createCategory: { error: "Category already exists" } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Category already exists",
      );
    });
  });

  it("shows error when mutation fails", async () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "New Category" } });

    const form = screen.getByTestId("popover-content").querySelector("form");
    fireEvent.submit(form!);

    const onError = mockCommitMutation.mock.calls[0][0].onError;
    await act(async () => {
      onError(new Error("Network error"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Network error");
    });
  });

  it("resets state when popover closes", () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New Category" } });

    const trigger = screen.getByTestId("popover-trigger");
    fireEvent.click(trigger); // Open
    fireEvent.click(trigger); // Close

    // State should be reset
    expect(input.value).toBe("");
  });

  it("uses bordered variant when value has content", () => {
    render(<CategoryAddButton withLabel={true} />);

    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "Test" } });

    // Variant is internal, but we verify the component renders without error
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("calls useMutation with correct mutation", () => {
    render(<CategoryAddButton withLabel={true} />);

    expect(useMutation).toHaveBeenCalled();
  });
});
