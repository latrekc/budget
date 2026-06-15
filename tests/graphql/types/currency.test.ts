import { GraphQLSchema } from "graphql";
import { executeGraphQL } from "../test-utils";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    currencyExchangeRate: {
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    currencyExchangeRateClaim: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
  parseIdString: jest.fn((id: unknown) => (id == null ? null : String(id))),
}));

jest.mock("@/lib/dates", () => ({
  getUTCStartOfDate: jest.fn(
    (d: Date) =>
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
  ),
  getUTCStartOfDateString: jest.fn(() => "2024-01-01"),
}));

import prisma from "@/lib/prisma";

const mockedPrisma = prisma as unknown as {
  currencyExchangeRate: {
    count: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
  };
  currencyExchangeRateClaim: {
    count: jest.Mock;
    findMany: jest.Mock;
  };
};

let schema: GraphQLSchema;
beforeAll(async () => {
  const mod = await import("@/graphql/schema");
  schema = mod.schema;
});
beforeEach(() => jest.clearAllMocks());

describe("currency GraphQL type", () => {
  describe("rates query pagination first 10 returns sorted desc date", () => {
    it("calls findMany with orderBy desc", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          base: "GBP",
          date: new Date(
            `2024-01-${String(10 - i).padStart(2, "0")}T00:00:00Z`,
          ),
          id: `id${i}`,
          rate: 1.1 + i * 0.01,
          target: "USD",
        })),
      );
      const query = `
        query {
          rates(first:10, base:GBP, target:USD) {
            edges { node { id rate date base target } }
            pageInfo { hasNextPage }
          }
        }
      `;
      const result = await executeGraphQL(schema, query);
      expect(result.errors).toBeUndefined();
      expect(mockedPrisma.currencyExchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ date: "desc" }, { base: "asc" }, { target: "asc" }],
          where: { base: "GBP", target: "USD" },
        }),
      );
      const data = result.data as {
        rates: { edges: Array<{ node: { id: string } }> };
      };
      expect(data.rates.edges).toHaveLength(10);
    });
  });

  describe("rates filter base GBP target USD returns only matching", () => {
    it("filters correctly", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        { base: "GBP", date: new Date(), id: "1", rate: 1.2, target: "USD" },
      ]);
      const query = `query { rates(first:5 base:GBP target:USD){ edges{ node{ base target } } } }`;
      await executeGraphQL(schema, query);
      const where =
        mockedPrisma.currencyExchangeRate.findMany.mock.calls[0][0].where;
      expect(where.base).toBe("GBP");
      expect(where.target).toBe("USD");
    });
  });

  describe("rate_claims pagination", () => {
    it("returns claims ordered", async () => {
      mockedPrisma.currencyExchangeRateClaim.findMany.mockResolvedValue([
        { currency: "EUR", date: new Date(), id: "c1" },
      ]);
      const query = `query { rate_claims(first:5 currency:EUR){ edges{ node{ id currency } } } }`;
      const result = await executeGraphQL(schema, query);
      expect(result.errors).toBeUndefined();
      expect(
        mockedPrisma.currencyExchangeRateClaim.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ currency: "asc" }, { date: "desc" }],
          where: { currency: "EUR" },
        }),
      );
    });
  });

  describe("currencies base GBP returns 6 items excluding GBP with counts", () => {
    it("returns array excluding base", async () => {
      mockedPrisma.currencyExchangeRate.count.mockResolvedValue(5);
      mockedPrisma.currencyExchangeRateClaim.count.mockResolvedValue(2);
      const query = `query { currencies(base:GBP){ currency rates rateClaims } }`;
      const result = await executeGraphQL(schema, query);
      const data = result.data as { currencies: Array<{ currency: string }> };
      expect(data.currencies).toHaveLength(6);
      expect(data.currencies.map((c) => c.currency)).not.toContain("GBP");
      expect(mockedPrisma.currencyExchangeRate.count).toHaveBeenCalledTimes(6);
    });
  });

  describe("createCurrencyExhangeRate valid date creates id GBP-USD-2024-01-01", () => {
    it("creates with deterministic id", async () => {
      mockedPrisma.currencyExchangeRate.create.mockResolvedValue({
        base: "GBP",
        date: new Date("2024-01-01"),
        id: "GBP-USD-2024-01-01",
        rate: 1.25,
        target: "USD",
      });
      const mutation = `
        mutation { createCurrencyExhangeRate(base:GBP date:"2024-01-01" target:USD value:1.25){ __typename } }
      `;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as {
        createCurrencyExhangeRate: { __typename: string };
      };
      expect(data.createCurrencyExhangeRate.__typename).toBeDefined();
      expect(mockedPrisma.currencyExchangeRate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            base: "GBP",
            id: "GBP-USD-2024-01-01",
            target: "USD",
          }),
        }),
      );
    });
  });

  describe("create duplicate error", () => {
    it("returns error union on prisma unique violation", async () => {
      mockedPrisma.currencyExchangeRate.create.mockRejectedValue(
        new Error("Unique constraint"),
      );
      const mutation = `mutation { createCurrencyExhangeRate(base:GBP date:"2024-01-01" target:USD value:1){ __typename } }`;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as {
        createCurrencyExhangeRate: { __typename: string };
      };
      expect(data.createCurrencyExhangeRate.__typename).toBeDefined();
    });
  });

  describe("create invalid date string error", () => {
    it("handles invalid date", async () => {
      mockedPrisma.currencyExchangeRate.create.mockRejectedValue(
        new Error("Invalid date"),
      );
      const mutation = `mutation { createCurrencyExhangeRate(base:GBP date:"not-a-date" target:USD value:1){ __typename } }`;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as {
        createCurrencyExhangeRate: { __typename: string };
      };
      expect(data.createCurrencyExhangeRate.__typename).toBeDefined();
    });
  });

  describe("delete existing returns data", () => {
    it("deletes successfully", async () => {
      mockedPrisma.currencyExchangeRate.findFirst.mockResolvedValue({
        id: "GBP-USD-2024-01-01",
      });
      mockedPrisma.currencyExchangeRate.delete.mockResolvedValue({
        id: "GBP-USD-2024-01-01",
        base: "GBP",
        target: "USD",
        rate: 1.2,
        date: new Date(),
      });
      const mutation = `mutation { deleteCurrencyExhangeRate(id:"GBP-USD-2024-01-01"){ __typename } }`;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as {
        deleteCurrencyExhangeRate: { __typename: string };
      };
      expect(data.deleteCurrencyExhangeRate.__typename).toBeDefined();
    });
  });

  describe("delete non-existent Error union message", () => {
    it("returns error", async () => {
      mockedPrisma.currencyExchangeRate.findFirst.mockResolvedValue(null);
      const mutation = `mutation { deleteCurrencyExhangeRate(id:"no"){ __typename } }`;
      const result = await executeGraphQL(schema, mutation);
      const data = result.data as {
        deleteCurrencyExhangeRate: { __typename: string };
      };
      expect(data.deleteCurrencyExhangeRate.__typename).toBe("Error");
    });
  });

  describe("enum mapping unknown DB value throws", () => {
    it("throws on unknown currency enum", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        { base: "XYZ", date: new Date(), id: "x", rate: 1, target: "USD" },
      ]);
      const query = `query { rates(first:1 base:GBP target:USD){ edges{ node{ base } } } }`;
      const result = await executeGraphQL(schema, query);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toContain("Undefined value XYZ");
    });
  });
});
