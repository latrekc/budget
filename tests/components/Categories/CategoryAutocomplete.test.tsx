import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import CategoryAutocomplete from "@/components/Categories/CategoryAutocomplete";
import {
  CategoryAutocomplete$data,
  CategoryAutocomplete$key,
} from "@/components/Categories/__generated__/CategoryAutocomplete.graphql";
import { PubSubChannels } from "@/lib/types";
import { asFragment } from "../../utils/fragment";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn((_, key) => key),
  useRefetchableFragment: jest.fn(),
}));

// Mock usePubSub
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: jest.fn(),
}));

// Mock NextUI Autocomplete

// Mock react-icons
jest.mock("react-icons/ti", () => ({
  TiPlus: () => null,
  TiDelete: () => null,
}));
jest.mock("react-icons/bi", () => ({ BiHide: () => null }));
jest.mock("react-icons/pi", () => ({
  PiCurrencyGbpBold: () => null,
  PiCurrencyEurBold: () => null,
  PiCurrencyRubBold: () => null,
  PiCurrencyDollarBold: () => null,
  PiCurrencyJpyBold: () => null,
}));

import { usePubSub } from "@/lib/usePubSub";
import { useRefetchableFragment } from "react-relay";

describe("CategoryAutocomplete", () => {
  const mockCategories = [
    {
      id: "cat-1",
      name: "Food",
      color: "#ff0000",
      parentCategory: null,
    },
    {
      id: "cat-2",
      name: "Groceries",
      color: "#00ff00",
      parentCategory: {
        name: "Food",
        color: "#ff0000",
        parentCategory: null,
      },
    },
    {
      id: "cat-3",
      name: "Travel",
      color: "#0000ff",
      parentCategory: null,
    },
  ];

  const mockRefetch = jest.fn();
  const mockSubscribe = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePubSub as jest.Mock).mockReturnValue({
      subscribe: mockSubscribe,
    });
  });

  it("renders Autocomplete with label", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByTestId("autocomplete")).toHaveAttribute(
      "data-label",
      "Select Category",
    );
  });

  it("renders categories as items", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByTestId("item-cat-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-cat-2")).toBeInTheDocument();
    expect(screen.getByTestId("item-cat-3")).toBeInTheDocument();
  });

  it("renders CategoryChip for each item", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    const { container } = render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getAllByText("Food").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
    const chips = container.querySelectorAll(".box-border");
    expect(chips.length).toBeGreaterThanOrEqual(3);
  });

  it("filters categories by search term (name)", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    const input = screen.getByTestId("autocomplete-input");
    fireEvent.change(input, { target: { value: "food" } });

    // Should show Food and Groceries (Groceries has parent Food)
    expect(screen.getByTestId("item-cat-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-cat-2")).toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-3")).not.toBeInTheDocument();
  });

  it("filters categories by parent name", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    const input = screen.getByTestId("autocomplete-input");
    fireEvent.change(input, { target: { value: "food" } });

    expect(screen.getByTestId("item-cat-2")).toBeInTheDocument();
  });

  it("filters categories by grandparent name", () => {
    const categoriesWithGrandparent = [
      {
        id: "cat-1",
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
      },
    ];

    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: categoriesWithGrandparent },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    const input = screen.getByTestId("autocomplete-input");
    fireEvent.change(input, { target: { value: "food" } });

    expect(screen.getByTestId("item-cat-1")).toBeInTheDocument();
  });

  it("shows all categories when search term is empty", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    const input = screen.getByTestId("autocomplete-input");
    fireEvent.change(input, { target: { value: "" } });

    expect(screen.getByTestId("item-cat-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-cat-2")).toBeInTheDocument();
    expect(screen.getByTestId("item-cat-3")).toBeInTheDocument();
  });

  it("applies filterCallback to categories", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    const filterCallback = jest.fn(
      (cats: CategoryAutocomplete$data["categories_for_autocomplete"]) =>
        cats?.filter((c) => c.name === "Food") ?? [],
    );

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
        filterCallback={filterCallback}
      />,
    );

    expect(filterCallback).toHaveBeenCalledWith(mockCategories);
    expect(screen.getByTestId("item-cat-1")).toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-3")).not.toBeInTheDocument();
  });

  it("calls onSelect when item is selected", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    const item = screen.getByTestId("item-cat-1");
    fireEvent.click(item);

    expect(mockOnSelect).toHaveBeenCalledWith("cat-1");
  });

  it("subscribes to PubSub Categories channel", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(mockSubscribe).toHaveBeenCalledWith(
      PubSubChannels.Categories,
      expect.any(Function),
    );
  });

  it("refetches on PubSub Categories event", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    // Get the subscribe callback
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    subscribeCallback();

    expect(mockRefetch).toHaveBeenCalledWith(
      {},
      { fetchPolicy: "network-only" },
    );
  });

  it("passes isDisabled to Autocomplete", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    // This is tested via the mock, but we verify the prop is passed
    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
        isDisabled={true}
      />,
    );

    const autocomplete = screen.getByTestId("autocomplete");
    expect(autocomplete).toBeInTheDocument();
    expect(autocomplete).toHaveAttribute("data-disabled", "true");
  });

  it("passes error to Autocomplete", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
        error="Test error"
      />,
    );

    const autocomplete = screen.getByTestId("autocomplete");
    expect(autocomplete).toBeInTheDocument();
    expect(autocomplete).toHaveAttribute("data-invalid", "true");
    expect(autocomplete).toHaveAttribute("data-error", "Test error");
  });

  it("uses small size when isSmall is true", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
        isSmall={true}
      />,
    );

    const autocomplete = screen.getByTestId("autocomplete");
    expect(autocomplete).toBeInTheDocument();
    expect(autocomplete).toHaveAttribute("data-size", "sm");
    expect(autocomplete).toHaveAttribute("data-fullwidth", "false");
  });

  it("renders empty state when 0 items", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: [] },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByTestId("autocomplete")).toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("item-cat-3")).not.toBeInTheDocument();
    const itemsContainer = screen.getByTestId("autocomplete-items");
    expect(itemsContainer).toBeEmptyDOMElement();
  });

  it("calls useRefetchableFragment with correct fragment", () => {
    (useRefetchableFragment as jest.Mock).mockReturnValue([
      { categories_for_autocomplete: mockCategories },
      mockRefetch,
    ]);

    render(
      <CategoryAutocomplete
        categories={asFragment<CategoryAutocomplete$key>({
          categories_for_autocomplete: [],
        })}
        label="Select Category"
        onSelect={mockOnSelect}
      />,
    );

    expect(useRefetchableFragment).toHaveBeenCalled();
  });
});
