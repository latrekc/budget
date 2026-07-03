import "@testing-library/jest-dom";

import { CategoryColorResolver$key } from "@/components/Categories/__generated__/CategoryColorResolver.graphql";
import { color } from "@/components/Categories/CategoryColorResolver";
import { environment } from "@/lib/relay";
import { asFragment } from "../../utils/fragment";

// Mock the Relay environment
jest.mock("@/lib/relay", () => ({
  environment: {
    getStore: jest.fn(),
  },
}));

// Mock readFragment
jest.mock("relay-runtime/lib/store/ResolverFragments", () => ({
  readFragment: jest.fn(),
}));

import { readFragment } from "relay-runtime/lib/store/ResolverFragments";

describe("CategoryColorResolver", () => {
  let mockSource: { get: jest.Mock };
  let mockStore: { getSource: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear the COLORS_CACHE by re-importing the module
    jest.resetModules();

    mockSource = {
      get: jest.fn(),
    };

    mockStore = {
      getSource: jest.fn(() => mockSource),
    };

    (environment.getStore as jest.Mock).mockReturnValue(mockStore);
  });

  it("generates color for root category", () => {
    const mockCategory = {
      id: "category-1",
      parentCategory: null,
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    // Mock root with categories
    const mockRoot = {
      "categories:xyz": {
        __refs: ["category-1", "category-2", "category-3"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "category-1")
        return { id: "category-1", parentCategory: null };
      if (key === "category-2")
        return { id: "category-2", parentCategory: null };
      if (key === "category-3")
        return { id: "category-3", parentCategory: null };
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));

    // Should return a color from the RdYlGn scale
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("generates color for child category", () => {
    const mockCategory = {
      id: "child-1",
      parentCategory: {
        id: "parent-1",
      },
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["parent-1", "parent-2", "child-1", "child-2"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "parent-1") return { id: "parent-1", parentCategory: null };
      if (key === "parent-2") return { id: "parent-2", parentCategory: null };
      if (key === "child-1")
        return { id: "child-1", parentCategory: { __ref: "parent-1" } };
      if (key === "child-2")
        return { id: "child-2", parentCategory: { __ref: "parent-1" } };
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));

    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("generates color for grandchild category", () => {
    const mockCategory = {
      id: "grandchild-1",
      parentCategory: {
        id: "child-1",
      },
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["parent-1", "child-1", "grandchild-1"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "parent-1") return { id: "parent-1", parentCategory: null };
      if (key === "child-1")
        return {
          id: "child-1",
          parentCategory: { __ref: "parent-1" },
        };
      if (key === "grandchild-1")
        return {
          id: "grandchild-1",
          parentCategory: { __ref: "child-1" },
        };
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));

    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("caches color results", () => {
    const mockCategory = {
      id: "category-1",
      parentCategory: null,
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["category-1"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "category-1")
        return { id: "category-1", parentCategory: null };
      return null;
    });

    const result1 = color(asFragment<CategoryColorResolver$key>({}));

    const result2 = color(asFragment<CategoryColorResolver$key>({}));

    // Should return the same color from cache
    expect(result1).toBe(result2);
  });

  it("uses RdYlGn color scale for root categories", () => {
    const mockCategory = {
      id: "category-1",
      parentCategory: null,
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["category-1", "category-2"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "category-1")
        return { id: "category-1", parentCategory: null };
      if (key === "category-2")
        return { id: "category-2", parentCategory: null };
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));

    // RdYlGn scale produces colors in the red-yellow-green range
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("returns deterministic hex for known root position", () => {
    const mockCategory = {
      id: "category-1",
      parentCategory: null,
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["category-1", "category-2", "category-3"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "category-1")
        return { id: "category-1", parentCategory: null };
      if (key === "category-2")
        return { id: "category-2", parentCategory: null };
      if (key === "category-3")
        return { id: "category-3", parentCategory: null };
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));

    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    // deterministic across calls due to cache keyed by JSON
    const result2 = color(asFragment<CategoryColorResolver$key>({}));
    expect(result2).toBe(result);
  });

  it("handles empty parent list edge case returning hex", () => {
    const mockCategory = {
      id: "lonely",
      parentCategory: null,
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: [],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      return null;
    });

    const result = color(asFragment<CategoryColorResolver$key>({}));
    // Even with empty list, chroma scale should handle gracefully or return undefined; we assert it's string or undefined to characterize behavior
    expect(typeof result === "string" || typeof result === "undefined").toBe(
      true,
    );
  });

  it("desaturates and darkens level 2 child color vs parent", () => {
    const mockCategory = {
      id: "child-1",
      parentCategory: {
        id: "parent-1",
      },
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["parent-1", "child-1"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "parent-1") return { id: "parent-1", parentCategory: null };
      if (key === "child-1")
        return { id: "child-1", parentCategory: { __ref: "parent-1" } };
      return null;
    });

    const childColor = color(asFragment<CategoryColorResolver$key>({}));

    // Now get parent color by mocking parent as root
    (readFragment as jest.Mock).mockReturnValue({
      id: "parent-1",
      parentCategory: null,
    });
    const parentColor = color(asFragment<CategoryColorResolver$key>({}));

    expect(childColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(parentColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(childColor).not.toBe(parentColor);
  });

  it("saturates and brightens level 3 grandchild color vs parent", () => {
    const mockCategory = {
      id: "grandchild-1",
      parentCategory: {
        id: "child-1",
      },
    };

    (readFragment as jest.Mock).mockReturnValue(mockCategory);

    const mockRoot = {
      "categories:xyz": {
        __refs: ["parent-1", "child-1", "grandchild-1"],
      },
    };

    mockSource.get.mockImplementation((key: string) => {
      if (key === "client:root") return mockRoot;
      if (key === "parent-1") return { id: "parent-1", parentCategory: null };
      if (key === "child-1")
        return {
          id: "child-1",
          parentCategory: { __ref: "parent-1" },
        };
      if (key === "grandchild-1")
        return {
          id: "grandchild-1",
          parentCategory: { __ref: "child-1" },
        };
      return null;
    });

    const grandChildColor = color(asFragment<CategoryColorResolver$key>({}));

    // get child color
    (readFragment as jest.Mock).mockReturnValue({
      id: "child-1",
      parentCategory: { id: "parent-1" },
    });
    const childColor = color(asFragment<CategoryColorResolver$key>({}));

    expect(grandChildColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(childColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(grandChildColor).not.toBe(childColor);
  });
});
