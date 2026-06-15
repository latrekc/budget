import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import CategoryContent from "@/components/Categories/CategoryContent";
import { CategoryContent$key } from "@/components/Categories/__generated__/CategoryContent.graphql";
import { CategoryContent_Categories$key } from "@/components/Categories/__generated__/CategoryContent_Categories.graphql";
import {
  CategoriesContext,
  CategoryMode,
} from "@/components/Filters/FiltersCategories";
import { initialState } from "@/components/Filters/FiltersReducer";
import { asFragment } from "../../utils/fragment";

// Mock react-relay
jest.mock("react-relay", () => ({
  graphql: jest.fn(),
  useFragment: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), false]),
  useRefetchableFragment: jest.fn(() => [
    { categories_for_autocomplete: [] },
    jest.fn(),
  ]),
  useLazyLoadQuery: jest.fn(() => ({})),
  usePaginationFragment: jest.fn(() => ({
    data: {},
    loadNext: jest.fn(),
    hasNext: false,
    isLoadingNext: false,
  })),
  useQueryLoader: jest.fn(() => [null, jest.fn()]),
  usePreloadedQuery: jest.fn(() => ({})),
}));

// Mock usePubSub
jest.mock("@/lib/usePubSub", () => ({
  usePubSub: () => ({
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    unsubscribe: jest.fn(),
  }),
}));

// Mock NextUI simplified

// Mock react-icons
jest.mock("react-icons/ti", () => ({
  TiPlus: () => null,
  TiDelete: () => null,
}));
jest.mock("react-icons/lu", () => ({
  LuTextCursorInput: () => null,
  LuArrowUpDown: () => null,
  LuSplit: () => null,
}));
jest.mock("react-icons/bi", () => ({
  BiHide: () => null,
}));
jest.mock("react-icons/pi", () => ({
  PiCurrencyGbpBold: () => null,
  PiCurrencyEurBold: () => null,
  PiCurrencyRubBold: () => null,
  PiCurrencyDollarBold: () => null,
  PiCurrencyJpyBold: () => null,
}));

import { useFragment, useMutation } from "react-relay";

describe("CategoryContent", () => {
  const richCategory = (overrides: Record<string, unknown> = {}) => ({
    id: "cat-1",
    name: "Food",
    income: 0,
    outcome: 0,
    color: "#ff0000",
    parentCategory: null,
    subCategories: [],
    ...overrides,
  });

  const richCategories = {};

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockReturnValue([jest.fn(), false]);
    (useFragment as jest.Mock).mockImplementation(() => ({
      id: "cat-1",
      name: "Food",
      income: 0,
      outcome: 0,
      color: "#ff0000",
      parentCategory: null,
      subCategories: [],
    }));
  });

  function renderWithContext(
    categoryData: Record<string, unknown>,
    contextValue: {
      categoryMode: CategoryMode;
      filterName: string;
      filters: typeof initialState;
    },
    withAddButton = true,
  ) {
    (useFragment as jest.Mock).mockImplementation(() => ({
      id: "cat-1",
      name: "Food",
      income: 0,
      outcome: 0,
      color: "#ff0000",
      parentCategory: null,
      subCategories: [],
      ...categoryData,
    }));

    return render(
      <CategoriesContext.Provider value={contextValue}>
        <CategoryContent
          categories={asFragment<CategoryContent_Categories$key>(
            richCategories,
          )}
          category={asFragment<CategoryContent$key>(richCategory(categoryData))}
          withAddButton={withAddButton}
        />
      </CategoriesContext.Provider>,
    );
  }

  it("renders in EDIT mode with CategoryButtons", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "",
      filters: initialState,
    };
    renderWithContext({ name: "Food" }, context);

    expect(screen.getByText("Food", { selector: "span" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add subcategory" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove category" }),
    ).toBeInTheDocument();
  });

  it("passes withAddButton prop to CategoryButtons", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "",
      filters: initialState,
    };
    const { queryByRole } = renderWithContext({ name: "Food" }, context, false);

    expect(
      queryByRole("button", { name: "Add subcategory" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove category" }),
    ).toBeInTheDocument();
  });

  it("renders Checkbox in SELECT mode", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    expect(
      container.querySelector('input[type="checkbox"]'),
    ).toBeInTheDocument();
  });

  it("renders Checkbox in IGNORE mode", () => {
    const context = {
      categoryMode: CategoryMode.IGNORE,
      filterName: "",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    expect(
      container.querySelector('input[type="checkbox"]'),
    ).toBeInTheDocument();
  });

  it("disables checkbox when filter does not match", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "travel",
      filters: initialState,
    };
    const { container } = renderWithContext(
      {
        name: "Groceries",
        parentCategory: {
          name: "Food",
          color: "#00ff00",
          parentCategory: null,
        },
      },
      context,
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeDisabled();
  });

  it("disables checkbox when in wrong mode (SELECT with ignored category)", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: { ...initialState, ignoreCategories: ["cat-1"] },
    };
    const { container } = renderWithContext(
      { id: "cat-1", name: "Food" },
      context,
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeDisabled();
  });

  it("disables checkbox when in wrong mode (IGNORE with selected category)", () => {
    const context = {
      categoryMode: CategoryMode.IGNORE,
      filterName: "",
      filters: { ...initialState, categories: ["cat-1"] },
    };
    const { container } = renderWithContext(
      { id: "cat-1", name: "Food" },
      context,
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeDisabled();
  });

  it("renders income amount when non-zero", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    renderWithContext({ name: "Food", income: 50000, outcome: 0 }, context);

    expect(screen.getByText("£500")).toBeInTheDocument();
    const amountEl = screen.getByText("£500").closest("span");
    expect(amountEl).toHaveClass("text-green-900");
    expect(amountEl).toHaveClass("text-mono");
  });

  it("renders outcome amount when non-zero", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    renderWithContext({ name: "Food", income: 0, outcome: 30000 }, context);

    expect(screen.getByText("£300")).toBeInTheDocument();
  });

  it("renders both income and outcome with separator", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    renderWithContext({ name: "Food", income: 50000, outcome: 30000 }, context);

    expect(screen.getByText("£500")).toBeInTheDocument();
    expect(screen.getByText("£300")).toBeInTheDocument();
    expect(screen.getByText("/", { exact: false })).toBeInTheDocument();
  });

  it("does not render amounts when both are zero", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    const { container } = renderWithContext(
      { name: "Food", income: 0, outcome: 0 },
      context,
    );

    expect(container.textContent).not.toMatch(/£/);
  });

  it("matches filter by category name", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "food",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    const div = container.querySelector(".hover\\:bg-gray-100");
    expect(div).toBeInTheDocument();
  });

  it("matches filter by parent category name", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "food",
      filters: initialState,
    };
    const { container } = renderWithContext(
      {
        name: "Groceries",
        parentCategory: {
          name: "Food",
          color: "#00ff00",
          parentCategory: null,
        },
      },
      context,
    );

    const div = container.querySelector(".hover\\:bg-gray-100");
    expect(div).toBeInTheDocument();
  });

  it("matches filter by grandparent category name", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "food",
      filters: initialState,
    };
    const { container } = renderWithContext(
      {
        name: "Supermarket",
        parentCategory: {
          name: "Groceries",
          color: "#00ff00",
          parentCategory: { name: "Food", color: "#0000ff" },
        },
      },
      context,
    );

    const div = container.querySelector(".hover\\:bg-gray-100");
    expect(div).toBeInTheDocument();
  });

  it("applies opacity-50 when filter does not match", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "travel",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    const div = container.querySelector(".opacity-50");
    expect(div).toBeInTheDocument();
  });

  it("calls useFragment at least twice", () => {
    const context = {
      categoryMode: CategoryMode.EDIT,
      filterName: "",
      filters: initialState,
    };
    renderWithContext({ name: "Food" }, context);

    expect(useFragment).toHaveBeenCalled();
    expect((useFragment as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("SELECT mode checkbox has border primary class", () => {
    const context = {
      categoryMode: CategoryMode.SELECT,
      filterName: "",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    expect(container.innerHTML).toContain("data-[selected=true]:border-accent");
  });

  it("IGNORE mode checkbox has border danger class", () => {
    const context = {
      categoryMode: CategoryMode.IGNORE,
      filterName: "",
      filters: initialState,
    };
    const { container } = renderWithContext({ name: "Food" }, context);

    expect(container.innerHTML).toContain("data-[selected=true]:border-danger");
  });

  it("CategoryButtons shown only if isMatchFilter in EDIT mode", () => {
    const contextMatch = {
      categoryMode: CategoryMode.EDIT,
      filterName: "",
      filters: initialState,
    };
    const { queryByRole: queryMatch } = renderWithContext(
      { name: "Food" },
      contextMatch,
    );
    expect(
      queryMatch("button", { name: "Add subcategory" }),
    ).toBeInTheDocument();

    const contextNoMatch = {
      categoryMode: CategoryMode.EDIT,
      filterName: "travel",
      filters: initialState,
    };
    const { container: containerNoMatch } = renderWithContext(
      { name: "Food" },
      contextNoMatch,
    );
    expect(
      containerNoMatch.querySelector('[aria-label="Add subcategory"]'),
    ).not.toBeInTheDocument();
    expect(
      containerNoMatch.querySelector('[aria-label="Edit category"]'),
    ).not.toBeInTheDocument();
    expect(
      containerNoMatch.querySelector('[aria-label="Move category"]'),
    ).not.toBeInTheDocument();
    expect(
      containerNoMatch.querySelector('[aria-label="Remove category"]'),
    ).not.toBeInTheDocument();
  });
});
