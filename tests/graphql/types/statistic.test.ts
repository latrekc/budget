import { GraphQLSchema } from "graphql";
import { executeGraphQL } from "../test-utils";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    category: { findMany: jest.fn() },
    statistic: { findMany: jest.fn() },
    statisticPerMonths: { findMany: jest.fn() },
    statisticPerSource: { findMany: jest.fn() },
  },
  parseId: jest.fn((id: unknown) => (id == null ? null : Number(id))),
}));

import prisma from "@/lib/prisma";

const mockedPrisma = prisma as unknown as {
  category: { findMany: jest.Mock };
  statistic: { findMany: jest.Mock };
  statisticPerMonths: { findMany: jest.Mock };
  statisticPerSource: { findMany: jest.Mock };
};

let schema: GraphQLSchema;
beforeAll(async () => {
  const mod = await import("@/graphql/schema");
  schema = mod.schema;
});
beforeEach(() => jest.clearAllMocks());

describe("statistic GraphQL type", () => {
  describe("transactionsStatistic no filter returns all ordered", () => {
    it("returns ordered list", async () => {
      mockedPrisma.statistic.findMany.mockResolvedValue([
        {
          id: "2024-01-1",
          monthId: "2024-01",
          income: 1000,
          outcome: -500,
          category: { id: 1 },
        },
      ]);
      const query = `query { transactionsStatistic { id monthId income outcome } }`;
      const result = await executeGraphQL(schema, query);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.statistic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: [{ monthId: "asc" }] }),
      );
      const data = result.data as { transactionsStatistic: Array<unknown> };
      expect(data.transactionsStatistic).toHaveLength(1);
    });
  });

  describe("onlyIncome true filters out outcome-only rows", () => {
    it("sets income gt filter", async () => {
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, { f: { onlyIncome: true } });
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.income).toEqual({ gt: 0 });
      expect(where.OR).toBeUndefined();
    });
  });

  describe("months filter", () => {
    it("returns only March", async () => {
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, { f: { months: ["2024-03"] } });
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.monthId).toEqual({ in: ["2024-03"] });
    });
  });

  describe("categories filter parent includes sub and grandchild ids", () => {
    it("expands to subcategories", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([
        { id: 2 },
        { id: 3 },
        { id: 4 },
      ]);
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, { f: { categories: ["1"] } });
      expect(mockedPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: expect.arrayContaining([{ id: { in: [1] } }]) },
        }),
      );
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.categoryId.in).toEqual([2, 3, 4]);
    });
  });

  describe("ignoreCategories excludes", () => {
    it("sets notIn", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([{ id: 5 }]);
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, { f: { ignoreCategories: ["9"] } });
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.categoryId.notIn).toEqual([5]);
    });
  });

  describe("categories + ignore overlapping in notIn works", () => {
    it("combines in and notIn", async () => {
      mockedPrisma.category.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([{ id: 2 }]);
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, {
        f: { categories: ["1"], ignoreCategories: ["2"] },
      });
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.categoryId.in).toEqual([1, 2]);
      expect(where.categoryId.notIn).toEqual([2]);
    });
  });

  describe("empty categories array treated as no filter", () => {
    it("does not set categoryId filter", async () => {
      mockedPrisma.statistic.findMany.mockResolvedValue([]);
      const query = `query($f:FilterStatisticInput){ transactionsStatistic(filters:$f){ id } }`;
      await executeGraphQL(schema, query, { f: { categories: [] } });
      const where = mockedPrisma.statistic.findMany.mock.calls[0][0].where;
      expect(where.categoryId).toBeUndefined();
    });
  });

  describe("perMonths query returns year month ints", () => {
    it("returns data", async () => {
      mockedPrisma.statisticPerMonths.findMany.mockResolvedValue([
        { id: "2024-01", year: 2024, month: 1, income: 100, outcome: -50 },
      ]);
      const query = `query { transactionsStatisticPerMonths { id year month income outcome } }`;
      const result = await executeGraphQL(schema, query);
      const data = result.data as {
        transactionsStatisticPerMonths: Array<{ year: number }>;
      };
      expect(data.transactionsStatisticPerMonths[0].year).toBe(2024);
    });
  });

  describe("perSource returns enum Source mapping", () => {
    it("maps source enum", async () => {
      mockedPrisma.statisticPerSource.findMany.mockResolvedValue([
        { id: "Monzo", source: "Monzo", income: 200, outcome: -100 },
      ]);
      const query = `query { transactionsStatisticPerSource { id source income outcome } }`;
      const result = await executeGraphQL(schema, query);
      const data = result.data as {
        transactionsStatisticPerSource: Array<{ source: string }>;
      };
      expect(data.transactionsStatisticPerSource[0].source).toBe("Monzo");
    });
  });
});
