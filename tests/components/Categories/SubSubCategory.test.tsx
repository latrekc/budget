import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import SubSubCategory from "@/components/Categories/SubSubCategory";
import { SubSubCategory$key } from "@/components/Categories/__generated__/SubSubCategory.graphql";
import { SubSubCategory_Categories$key } from "@/components/Categories/__generated__/SubSubCategory_Categories.graphql";
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

describe("SubSubCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderSubSubCategory(subCategoryData: Record<string, unknown> = {}) {
    (useFragment as jest.Mock).mockImplementation(
      (_fragment, fragmentKey: unknown) => {
        const base = {
          id: "subsub-1",
          name: "Vegetables",
          income: 0,
          outcome: 0,
          color: "#ff0000",
          parentCategory: {
            name: "Groceries",
            color: "#00ff00",
            parentCategory: { name: "Food", color: "#0000ff" },
          },
        };
        const keyData =
          fragmentKey && typeof fragmentKey === "object"
            ? (fragmentKey as Record<string, unknown>)
            : {};
        return { ...base, ...keyData, ...subCategoryData };
      },
    );

    return render(
      <CategoriesContext.Provider
        value={{
          categoryMode: CategoryMode.EDIT,
          filterName: "",
          filters: initialState,
        }}
      >
        <SubSubCategory
          categories={asFragment<SubSubCategory_Categories$key>({})}
          subCategory={asFragment<SubSubCategory$key>({
            id: "subsub-1",
            name: "Vegetables",
            ...subCategoryData,
          })}
        />
      </CategoriesContext.Provider>,
    );
  }

  it("renders CategoryContent with withAddButton=false", () => {
    const { container, getByText } = renderSubSubCategory({});

    expect(getByText("Vegetables", { selector: "span" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add subcategory" }),
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
    const addButton = container.querySelector(
      '[aria-label="Add subcategory"], [aria-label="Add category"]',
    );
    expect(addButton).toBeNull();
  });

  it("calls useFragment for SubSubCategory fragment", () => {
    renderSubSubCategory({});

    expect(useFragment).toHaveBeenCalled();
    expect((useFragment as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("renders with padding class", () => {
    const { container } = renderSubSubCategory({});

    const wrapper = container.querySelector(".p-x-4");
    expect(wrapper).toBeInTheDocument();
    expect(container.querySelectorAll(".pl-4")).toHaveLength(0);
  });
});
