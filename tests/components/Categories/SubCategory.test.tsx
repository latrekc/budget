import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import SubCategory from "@/components/Categories/SubCategory";
import { SubCategory$key } from "@/components/Categories/__generated__/SubCategory.graphql";
import { SubCategory_Categories$key } from "@/components/Categories/__generated__/SubCategory_Categories.graphql";
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

describe("SubCategory", () => {
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
        <SubCategory
          categories={asFragment<SubCategory_Categories$key>({})}
          subCategory={asFragment<SubCategory$key>(topCategoryData)}
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

    expect(screen.getAllByText("Food", { selector: "span" })).toHaveLength(1);
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

  it("renders 2 level3 items tree and asserts per-level counts", () => {
    const mockSubCategory = {
      subCategories: [
        {
          id: "subsub-1",
          name: "Level3-A",
          color: "#0000ff",
          parentCategory: {
            name: "Level2",
            color: "#00ff00",
            parentCategory: { name: "Root", color: "#ff0000" },
          },
          subCategories: [],
        },
        {
          id: "subsub-2",
          name: "Level3-B",
          color: "#0000aa",
          parentCategory: {
            name: "Level2",
            color: "#00ff00",
            parentCategory: { name: "Root", color: "#ff0000" },
          },
          subCategories: [],
        },
      ],
    };

    const { container, getByText } = renderCategory(mockSubCategory);

    expect(getByText("Level3-A", { selector: "span" })).toBeInTheDocument();
    expect(getByText("Level3-B", { selector: "span" })).toBeInTheDocument();
    expect(container.querySelector(".pl-4")).toBeInTheDocument();
    expect(container.querySelectorAll(".pl-4")).toHaveLength(1);

    expect(screen.getAllByText("Level3-A", { selector: "span" })).toHaveLength(
      1,
    );
    expect(screen.getAllByText("Level3-B", { selector: "span" })).toHaveLength(
      1,
    );
  });

  it("renders 2 sub-subcategories in stable order implying key usage and asserts count 2", () => {
    const mockSubCategory = {
      subCategories: [
        {
          id: "x1",
          name: "Xray",
          color: "#111",
          parentCategory: { name: "L2", color: "#222", parentCategory: null },
          subCategories: [],
        },
        {
          id: "y2",
          name: "Yankee",
          color: "#333",
          parentCategory: { name: "L2", color: "#222", parentCategory: null },
          subCategories: [],
        },
      ],
    };

    const { getByText } = renderCategory(mockSubCategory);
    const x = getByText("Xray", { selector: "span" });
    const y = getByText("Yankee", { selector: "span" });
    expect(
      x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      screen.getAllByText(/Xray|Yankee/, { selector: "span" }),
    ).toHaveLength(2);
  });
});
