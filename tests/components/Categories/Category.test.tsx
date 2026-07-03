import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import Category from "@/components/Categories/Category";
import { Category$key } from "@/components/Categories/__generated__/Category.graphql";
import { Category_Categories$key } from "@/components/Categories/__generated__/Category_Categories.graphql";
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
jest.mock("react-icons/md", () => ({
  MdMoveDown: () => null,
}));

import { useFragment } from "react-relay";

describe("Category", () => {
  const mockCategoriesContext = {
    filterName: "",
    categoryMode: CategoryMode.EDIT,
    filters: initialState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderCategory(
    categoryData: Record<string, unknown>,
    context = mockCategoriesContext,
  ) {
    (useFragment as jest.Mock).mockImplementation(
      (_fragment, fragmentKey: unknown) => {
        const base = {
          id: "cat-1",
          name: "Food",
          income: 0,
          outcome: 0,
          color: "#ff0000",
          parentCategory: null,
          subCategories: [],
        };
        const keyData =
          fragmentKey && typeof fragmentKey === "object"
            ? (fragmentKey as Record<string, unknown>)
            : {};
        // Merge base defaults with fragment key data, then with test override for top-level only when key matches top id
        // For simplicity, merge all, allowing test-provided categoryData to override top-level via explicit calls in test setup through mockImplementationOnce pattern not used here.
        // Instead we rely on fragmentKey containing actual data for nested calls, and for top-level we merge categoryData.
        const merged = { ...base, ...keyData };
        // If this looks like top-level Category (has subCategories defined in test override and id matches cat-1), apply categoryData override
        if (merged.id === "cat-1" || merged.id === undefined) {
          Object.assign(merged, categoryData);
        }
        return merged;
      },
    );

    const topCategoryData = {
      id: "cat-1",
      name: "Food",
      subCategories: [],
      ...categoryData,
    };

    return render(
      <CategoriesContext.Provider value={context}>
        <Category
          categories={asFragment<Category_Categories$key>({})}
          category={asFragment<Category$key>(topCategoryData)}
        />
      </CategoriesContext.Provider>,
    );
  }

  it("renders CategoryContent", () => {
    const { getByText } = renderCategory({ subCategories: [] });

    expect(getByText("Food", { selector: "span" })).toBeInTheDocument();
  });

  it("renders 2 subCategories flat list and asserts 2 SubCategory components", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "sub-1",
          name: "Sub 1",
          subCategories: [],
          parentCategory: {
            name: "Food",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#00ff00",
        },
        {
          id: "sub-2",
          name: "Sub 2",
          subCategories: [],
          parentCategory: {
            name: "Food",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#0000ff",
        },
      ],
    };

    const { container, getByText } = renderCategory(mockCategory);

    expect(getByText("Sub 1", { selector: "span" })).toBeInTheDocument();
    expect(getByText("Sub 2", { selector: "span" })).toBeInTheDocument();
    expect(container.querySelector(".pl-4")).toBeInTheDocument();
    expect(container.querySelectorAll(".pl-4")).toHaveLength(1);
    // Using screen after render via global document
    const subItems = screen.getAllByText(/Sub [12]/, { selector: "span" });
    expect(subItems).toHaveLength(2);
  });

  it("filters subCategories by name to 1 item and asserts count before after", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "sub-1",
          name: "Food",
          subCategories: [],
          parentCategory: {
            name: "Root",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#00ff00",
        },
        {
          id: "sub-2",
          name: "Travel",
          subCategories: [],
          parentCategory: {
            name: "Root",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#0000ff",
        },
      ],
    };

    const contextWithFilter = {
      ...mockCategoriesContext,
      filterName: "food",
    };

    const { queryByText } = renderCategory(mockCategory, contextWithFilter);

    // Top-level Category is named "Food" by default, plus 1 filtered subcategory named Food = total 2
    expect(screen.getAllByText("Food", { selector: "span" })).toHaveLength(2);
    expect(screen.queryAllByText("Travel", { selector: "span" })).toHaveLength(
      0,
    );
    expect(queryByText("Travel")).not.toBeInTheDocument();
  });

  it("filters subCategories by parent category name to 1 item", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "sub-1",
          name: "Groceries",
          subCategories: [],
          parentCategory: {
            name: "Food",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#00ff00",
        },
        {
          id: "sub-2",
          name: "Hotels",
          subCategories: [],
          parentCategory: {
            name: "Travel",
            color: "#0000ff",
            parentCategory: null,
          },
          color: "#00ff00",
        },
      ],
    };

    const contextWithFilter = {
      ...mockCategoriesContext,
      filterName: "food",
    };

    const { getByText, queryByText } = renderCategory(
      mockCategory,
      contextWithFilter,
    );

    expect(getByText("Groceries", { selector: "span" })).toBeInTheDocument();
    expect(queryByText("Hotels")).not.toBeInTheDocument();

    expect(screen.getAllByText("Groceries", { selector: "span" })).toHaveLength(
      1,
    );
    expect(screen.queryAllByText("Hotels")).toHaveLength(0);
  });

  it("filters subCategories by sub-subcategory name to 1 item", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "sub-1",
          name: "Food",
          subCategories: [{ id: "subsub-1", name: "Groceries" }],
          parentCategory: {
            name: "Root",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#00ff00",
        },
        {
          id: "sub-2",
          name: "Travel",
          subCategories: [{ id: "subsub-2", name: "Hotels" }],
          parentCategory: {
            name: "Root",
            color: "#ff0000",
            parentCategory: null,
          },
          color: "#0000ff",
        },
      ],
    };

    const contextWithFilter = {
      ...mockCategoriesContext,
      filterName: "groceries",
    };

    const { queryByText } = renderCategory(mockCategory, contextWithFilter);

    // Top-level Food plus filtered subcategory Food = 2
    expect(screen.getAllByText("Food", { selector: "span" })).toHaveLength(2);
    expect(screen.queryAllByText("Travel", { selector: "span" })).toHaveLength(
      0,
    );
    expect(queryByText("Travel")).not.toBeInTheDocument();
  });

  it("does not render subCategories container when 0 items and asserts queryAll length 0", () => {
    const { container } = renderCategory({ subCategories: [] });

    expect(container.querySelector(".pl-4")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".pl-4")).toHaveLength(0);

    expect(screen.queryAllByText(/Sub/)).toHaveLength(0);
  });

  it("calls useFragment at least twice", () => {
    renderCategory({ subCategories: [] });

    expect(useFragment).toHaveBeenCalled();
    expect((useFragment as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(
      2,
    );
  });
  it("renders 1-1-1 tree and asserts per-level counts", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "sub-1",
          name: "Level2-A",
          color: "#00ff00",
          parentCategory: {
            name: "Root",
            color: "#ff0000",
            parentCategory: null,
          },
          subCategories: [
            {
              id: "subsub-1",
              name: "Level3-A",
              color: "#0000ff",
              parentCategory: {
                name: "Level2-A",
                color: "#00ff00",
                parentCategory: { name: "Root", color: "#ff0000" },
              },
              subCategories: [],
            },
          ],
        },
      ],
    };

    const { container, getByText } = renderCategory(mockCategory);

    expect(getByText("Level2-A", { selector: "span" })).toBeInTheDocument();
    expect(getByText("Level3-A", { selector: "span" })).toBeInTheDocument();
    // pl-4 indicates nesting level, should appear exactly twice for 3-level tree (level2 container and level3 container)
    const nested = container.querySelectorAll(".pl-4");
    expect(nested).toHaveLength(2);

    expect(screen.getAllByText("Level2-A", { selector: "span" })).toHaveLength(
      1,
    );
    expect(screen.getAllByText("Level3-A", { selector: "span" })).toHaveLength(
      1,
    );
  });

  it("renders 3 subCategories in stable order implying key=id usage and asserts count 3", () => {
    const mockCategory = {
      subCategories: [
        {
          id: "a1",
          name: "Alpha",
          color: "#111",
          parentCategory: { name: "Root", color: "#fff", parentCategory: null },
          subCategories: [],
        },
        {
          id: "b2",
          name: "Beta",
          color: "#222",
          parentCategory: { name: "Root", color: "#fff", parentCategory: null },
          subCategories: [],
        },
        {
          id: "c3",
          name: "Gamma",
          color: "#333",
          parentCategory: { name: "Root", color: "#fff", parentCategory: null },
          subCategories: [],
        },
      ],
    };

    const { getByText } = renderCategory(mockCategory);
    const alpha = getByText("Alpha", { selector: "span" });
    const beta = getByText("Beta", { selector: "span" });
    const gamma = getByText("Gamma", { selector: "span" });
    // order in DOM should match input order, indicating stable keys
    expect(
      alpha.compareDocumentPosition(beta) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      beta.compareDocumentPosition(gamma) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      screen.getAllByText(/Alpha|Beta|Gamma/, { selector: "span" }),
    ).toHaveLength(3);
  });
});
