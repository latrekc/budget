import { GraphQLSchema } from "graphql";
import { executeGraphQL } from "../test-utils";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    category: { findMany: jest.fn() },
    transaction: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    transactionsOnCategories: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(async (ops: Array<Promise<unknown>>) =>
      Promise.all(ops),
    ),
  },
  parseId: jest.fn((id: unknown) => (id == null ? null : Number(id))),
  parseIdString: jest.fn((id: unknown) => (id == null ? null : String(id))),
}));

jest.mock("@/lib/currency_rates", () => ({
  getTransactionCurrencyRate: jest.fn(() => 1),
  getTransactionsCurrencyRates: jest.fn(async () => new Map()),
}));

import { getTransactionsCurrencyRates } from "@/lib/currency_rates";
import prisma from "@/lib/prisma";

const mockedPrisma = prisma as unknown as {
  category: { findMany: jest.Mock };
  transaction: {
    aggregate: jest.Mock;
    count: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  transactionsOnCategories: {
    create: jest.Mock;
    delete: jest.Mock;
    deleteMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

let schema: GraphQLSchema;
beforeAll(async () => {
  const mod = await import("@/graphql/schema");
  schema = mod.schema;
});
beforeEach(() => jest.clearAllMocks());

describe("transaction GraphQL type", () => {
  describe("transactions query no filter default sort date desc", () => {
    it("orders by date desc amount asc", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      const query = `query { transactions(first:5){ edges{ node{ id } } } }`;
      await executeGraphQL(schema, query);
      expect(mockedPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ date: "desc" }, { amount: "asc" }],
        }),
      );
    });
  });

  describe("sortBy Amount orders amount asc then date desc", () => {
    it("uses amount ordering", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      const query = `query($f:FilterTransactionsInput){ transactions(first:5 filters:$f){ edges{ node{ id } } } }`;
      await executeGraphQL(schema, query, { f: { sortBy: "Amount" } });
      expect(mockedPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ amount_converted: "asc" }, { date: "desc" }],
        }),
      );
    });
  });

  describe("onlyIncome true returns only amount>0", () => {
    it("filters amount gt 0", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      const query = `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`;
      await executeGraphQL(schema, query, { f: { onlyIncome: true } });
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.amount).toEqual({ gt: 0 });
    });
  });

  describe("onlyUncomplited true returns completed false", () => {
    it("filters completed false", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      const query = `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`;
      await executeGraphQL(schema, query, { f: { onlyUncomplited: true } });
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.completed).toBe(false);
    });
  });

  describe("sources filter multi", () => {
    it("sets source in", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { sources: ["Monzo", "HSBC"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.source).toEqual({ in: ["Monzo", "HSBC"] });
    });
  });

  describe("currencies filter", () => {
    it("sets currency in", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { currencies: ["USD", "EUR"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.currency).toEqual({ in: ["USD", "EUR"] });
    });
  });

  describe("amount EQUAL 10.5 matches 1050 and -1050", () => {
    it("sets in array", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { amount: "10.5", amountRelation: "EQUAL" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.amount).toEqual({ in: [1050, -1050] });
    });
  });

  describe("amount GREATER 100 matches >10000 or <-10000", () => {
    it("sets OR gt lt", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { amount: "100", amountRelation: "GREATER" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.AND[0].OR).toEqual([
        { amount: { gt: 10000 } },
        { amount: { lt: -10000 } },
      ]);
    });
  });

  describe("amount LESS 50 matches between -5000 and 5000 exclusive", () => {
    it("sets gt lt range", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { amount: "50", amountRelation: "LESS" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.amount).toEqual({ gt: -5000, lt: 5000 });
    });
  });

  describe("months OR logic", () => {
    it("creates OR date ranges", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { months: ["2024-01", "2024-02"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.AND[0].OR).toHaveLength(2);
    });
  });

  describe("search contains", () => {
    it("sets description contains", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { search: "coffee" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.description).toEqual({ contains: "coffee" });
    });
  });

  describe("search !coffee NOT contains", () => {
    it("sets NOT", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { search: "!coffee" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.NOT).toEqual({ description: { contains: "coffee" } });
    });
  });

  describe("search a|b OR contains", () => {
    it("sets OR in AND", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { search: "a|b" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.AND[0].OR).toEqual([
        { description: { contains: "a" } },
        { description: { contains: "b" } },
      ]);
    });
  });

  describe("search !a|b AND NOT both", () => {
    it("sets AND NOT array", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { search: "!a|b" } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.AND).toEqual([
        { description: { not: { contains: "a" } } },
        { description: { not: { contains: "b" } } },
      ]);
    });
  });

  describe("categories filter includes subcategories", () => {
    it("expands categories", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([{ id: 2 }, { id: 3 }]);
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { categories: ["1"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.categories.some.categoryId.in).toEqual([2, 3]);
    });
  });

  describe("ignoreCategories excludes", () => {
    it("sets none", async () => {
      mockedPrisma.category.findMany.mockResolvedValue([{ id: 9 }]);
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { ignoreCategories: ["9"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.categories.none.categoryId.in).toEqual([9]);
    });
  });

  describe("categories + ignore combined", () => {
    it("sets some and none", async () => {
      mockedPrisma.category.findMany
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ id: 2 }]);
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { categories: ["1"], ignoreCategories: ["2"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.categories.some.categoryId.in).toEqual([1]);
      expect(where.categories.none.categoryId.in).toEqual([2]);
    });
  });

  describe("transactionsTotal returns correct count income outcome sums", () => {
    it("aggregates correctly", async () => {
      mockedPrisma.transaction.count.mockResolvedValue(10);
      mockedPrisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount_converted: 5000 } })
        .mockResolvedValueOnce({ _sum: { amount_converted: -2000 } });
      const query = `query($f:FilterTransactionsInput){ transactionsTotal(filters:$f){ count income outcome } }`;
      const result = await executeGraphQL(schema, query, { f: {} });
      const data = result.data as {
        transactionsTotal: { count: number; income: number; outcome: number };
      };
      expect(data.transactionsTotal.count).toBe(10);
      expect(data.transactionsTotal.income).toBe(5000);
      expect(data.transactionsTotal.outcome).toBe(-2000);
    });
  });

  describe("updateCategoriesForTransactions single split amount equals transaction completed true", () => {
    it("updates completed true", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t1", amount: 1000 },
      ]);
      mockedPrisma.transactionsOnCategories.deleteMany.mockResolvedValue({
        count: 0,
      });
      mockedPrisma.transactionsOnCategories.create.mockResolvedValue({});
      mockedPrisma.transaction.update.mockResolvedValue({});
      (getTransactionsCurrencyRates as jest.Mock).mockResolvedValue(
        new Map([["t1", 1]]),
      );

      const mutation = `
        mutation { updateCategoriesForTransactions(transactions:[{amount:1000 category:"1" transaction:"t1"}]){ __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { completed: true } }),
      );
    });
  });

  describe("partial split completed false", () => {
    it("sets completed false when sum less than amount", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t2", amount: 1000 },
      ]);
      mockedPrisma.transactionsOnCategories.deleteMany.mockResolvedValue({
        count: 0,
      });
      mockedPrisma.transactionsOnCategories.create.mockResolvedValue({});
      mockedPrisma.transaction.update.mockResolvedValue({});
      (getTransactionsCurrencyRates as jest.Mock).mockResolvedValue(
        new Map([["t2", 1]]),
      );

      const mutation = `mutation { updateCategoriesForTransactions(transactions:[{amount:400 category:"1" transaction:"t2"}]){ __typename } }`;
      await executeGraphQL(schema, mutation);
      expect(mockedPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { completed: false } }),
      );
    });
  });

  describe("deleteCategoriesForTransactions sets completed false and removes links", () => {
    it("deletes and updates", async () => {
      mockedPrisma.transactionsOnCategories.delete.mockResolvedValue({});
      mockedPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t3", completed: false },
      ]);
      const mutation = `mutation { deleteCategoriesForTransactions(transactions:[{amount:0 category:"1" transaction:"t3"}]){ __typename } }`;
      await executeGraphQL(schema, mutation);
      expect(mockedPrisma.transactionsOnCategories.delete).toHaveBeenCalled();
      expect(mockedPrisma.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { completed: false } }),
      );
    });
  });

  describe("updateCategoriesForAllTransactions marks completed true and assigns category", () => {
    it("updates many and inserts", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "a1", amount: 500 },
        { id: "a2", amount: -300 },
      ]);
      mockedPrisma.transactionsOnCategories.deleteMany.mockResolvedValue({
        count: 0,
      });
      mockedPrisma.transaction.updateMany.mockResolvedValue({ count: 2 });
      mockedPrisma.transactionsOnCategories.create.mockResolvedValue({});
      (getTransactionsCurrencyRates as jest.Mock).mockResolvedValue(
        new Map([
          ["a1", 1],
          ["a2", 1],
        ]),
      );

      const mutation = `mutation { updateCategoriesForAllTransactions(category:"5" filters:{}){ __typename } }`;
      const result = await executeGraphQL(schema, mutation);
      expect(mockedPrisma.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { completed: true } }),
      );
      expect(
        mockedPrisma.transactionsOnCategories.create,
      ).toHaveBeenCalledTimes(2);
      const data = result.data as {
        updateCategoriesForAllTransactions: { __typename: string };
      };
      expect(data.updateCategoriesForAllTransactions.__typename).toBeDefined();
    });
  });

  describe("invalid amount string error handling", () => {
    it("handles NaN amount gracefully via prisma where", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      const query = `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`;
      await executeGraphQL(schema, query, { f: { amount: "abc" } });
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.amount).toBeUndefined();
    });
  });

  describe("invalid month format handling", () => {
    it("passes invalid date to prisma likely resulting empty", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([]);
      await executeGraphQL(
        schema,
        `query($f:FilterTransactionsInput){ transactions(first:1 filters:$f){ edges{ node{ id } } } }`,
        { f: { months: ["invalid"] } },
      );
      const where = mockedPrisma.transaction.findMany.mock.calls[0][0].where;
      expect(where.AND[0].OR[0].date.gte).toBeInstanceOf(Date);
    });
  });
});
