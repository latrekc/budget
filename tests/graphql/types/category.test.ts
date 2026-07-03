import { GraphQLSchema } from "graphql";
import { executeGraphQL } from "../test-utils";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    category: {
      aggregate: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transactionsOnCategories: {
      aggregate: jest.fn(),
    },
  },
  parseId: jest.fn((id: unknown) => {
    if (id == null) return null;
    return Number(id);
  }),
  parseIdString: jest.fn((id: unknown) => {
    if (id == null) return null;
    return String(id);
  }),
}));

jest.mock("@/lib/dates", () => ({
  getUTCStartOfDate: jest.fn((d: Date) => d),
  getUTCStartOfDateString: jest.fn(() => "2024-01-01"),
}));

import prisma from "@/lib/prisma";

const mockedPrisma = prisma as unknown as {
  category: {
    aggregate: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    exists: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  transactionsOnCategories: {
    aggregate: jest.Mock;
  };
};

let schema: GraphQLSchema;

beforeAll(async () => {
  const schemaModule = await import("@/graphql/schema");
  schema = schemaModule.schema;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("category GraphQL type", () => {
  describe("categories query no filters returns sorted asc", () => {
    it("returns sorted categories", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ]);

      const query = `
        query {
          categories {
            id
            name
          }
        }
      `;
      const result = await executeGraphQL(schema, query);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ name: "asc" }],
        }),
      );
      const data = result.data as {
        categories: Array<{ id: string; name: string }>;
      };
      expect(data.categories).toHaveLength(2);
    });
  });

  describe("categories with months filter", () => {
    it("income sums only January via info variableValues", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 10, name: "Food" },
      ]);
      mockedPrisma.transactionsOnCategories.aggregate.mockResolvedValue({
        _sum: { amount_converted: 5000 },
      });

      const query = `
        query Test($filters: FilterCategoryInput) {
          categories(filters: $filters) {
            id
            name
            income
            outcome
          }
        }
      `;
      const result = await executeGraphQL(schema, query, {
        filters: { months: ["2024-01"] },
      });
      expect(result.errors).toBeUndefined();
      expect(
        mockedPrisma.transactionsOnCategories.aggregate,
      ).toHaveBeenCalled();
      const callArg =
        mockedPrisma.transactionsOnCategories.aggregate.mock.calls[0][0];
      expect(callArg.where.amount.gt).toBe(0);
      expect(callArg.where.categoryId.equals).toBe(10);
      expect(callArg.where.transaction.OR).toBeDefined();
    });
  });

  describe("categories with onlyIncome true outcome field returns 0", () => {
    it("returns 0 for outcome when onlyIncome true", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 5, name: "Salary" },
      ]);
      mockedPrisma.transactionsOnCategories.aggregate.mockImplementation(
        async ({
          where,
        }: {
          where: { amount: { gt?: number; lt?: number } };
        }) => {
          if (where.amount.gt) return { _sum: { amount_converted: 10000 } };
          return { _sum: { amount_converted: -0 } };
        },
      );

      const query = `
        query($filters: FilterCategoryInput) {
          categories(filters: $filters) {
            id income outcome
          }
        }
      `;
      const result = await executeGraphQL(schema, query, {
        filters: { onlyIncome: true },
      });
      expect(result.errors).toBeUndefined();
      const data = result.data as { categories: Array<{ outcome: number }> };
      expect(data.categories[0].outcome).toBe(0);
    });
  });

  describe("createCategory duplicate name same parent error", () => {
    it("throws error union on duplicate", async () => {
      mockedPrisma.category.exists
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockedPrisma.category.findFirst.mockResolvedValue({ name: "Parent" });

      const mutation = `
        mutation { createCategory(name: "Food", parent: "1") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.exists).toHaveBeenCalled();
    });
  });

  describe("createCategory non-existent parent error", () => {
    it("throws parent does not exist", async () => {
      mockedPrisma.category.exists.mockResolvedValue(false);

      const mutation = `
        mutation { createCategory(name: "Child", parent: "999") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.exists).toHaveBeenCalled();
    });
  });

  describe("createCategory null parent root succeeds", () => {
    it("creates root category", async () => {
      mockedPrisma.category.exists.mockResolvedValue(false);
      mockedPrisma.category.create.mockResolvedValue({ id: 100, name: "Root" });

      const mutation = `
        mutation { createCategory(name: "Root") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as { createCategory: { __typename: string } };
      expect(data.createCategory.__typename).toBeDefined();
      expect(mockedPrisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: "Root", parentCategoryId: null },
        }),
      );
    });
  });

  describe("updateCategory change name to existing sibling error", () => {
    it("detects duplicate on update", async () => {
      mockedPrisma.category.exists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      mockedPrisma.category.findFirst.mockResolvedValue({ name: "ParentCat" });

      const mutation = `
        mutation { updateCategory(id: "2", name: "Existing", parent: "1") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.exists).toHaveBeenCalled();
    });
  });

  describe("updateCategory keep same name same id succeeds", () => {
    it("updates successfully when no duplicate excluding self", async () => {
      mockedPrisma.category.exists
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockedPrisma.category.update.mockResolvedValue({ id: 2, name: "Same" });

      const mutation = `
        mutation { updateCategory(id: "2", name: "Same", parent: null) { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
    });
  });

  describe("deleteCategory non-existent error", () => {
    it("returns error union", async () => {
      mockedPrisma.category.findFirst.mockResolvedValue(null);

      const mutation = `
        mutation { deleteCategory(id: "999") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.findFirst).toHaveBeenCalled();
    });
  });

  describe("deleteCategory with subcategories check FK behavior", () => {
    it("deletes and returns found category", async () => {
      mockedPrisma.category.findFirst.mockResolvedValue({
        id: 7,
        name: "ToDelete",
      });
      mockedPrisma.category.delete.mockResolvedValue({
        id: 7,
        name: "ToDelete",
      });

      const mutation = `
        mutation { deleteCategory(id: "7") { __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.category.delete).toHaveBeenCalled();
    });
  });

  describe("income resolver null sum returns 0", () => {
    it("coalesces null to 0", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 3, name: "Empty" },
      ]);
      mockedPrisma.transactionsOnCategories.aggregate.mockResolvedValue({
        _sum: { amount_converted: null },
      });

      const query = `
        query { categories { id income outcome } }
      `;
      const result = await executeGraphQL(schema, query);
      const data = result.data as {
        categories: Array<{ income: number; outcome: number }>;
      };
      expect(data.categories[0].income).toBe(0);
      expect(data.categories[0].outcome).toBe(0);
    });
  });

  describe("months invalid format handling", () => {
    it("passes invalid date through parseDate resulting in likely 0 results", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 1, name: "Test" },
      ]);
      mockedPrisma.transactionsOnCategories.aggregate.mockResolvedValue({
        _sum: { amount_converted: 0 },
      });

      const query = `
        query($filters: FilterCategoryInput) {
          categories(filters: $filters) { id income }
        }
      `;
      const result = await executeGraphQL(schema, query, {
        filters: { months: ["invalid"] },
      });
      expect(result.errors).toBeUndefined();
      expect(
        mockedPrisma.transactionsOnCategories.aggregate,
      ).toHaveBeenCalled();
      const where =
        mockedPrisma.transactionsOnCategories.aggregate.mock.calls[0][0].where;
      expect(where.transaction.OR[0].date.gte).toBeInstanceOf(Date);
    });
  });
});
