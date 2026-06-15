import fs from "fs";
import {
  GraphQLSchema,
  IntrospectionQuery,
  buildClientSchema,
  getIntrospectionQuery,
  graphql,
} from "graphql";
import path from "path";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $extends: jest.fn().mockReturnThis(),
    category: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount_converted: 0 } }),
      create: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    currencyExchangeRate: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    currencyExchangeRateClaim: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    statistic: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    statisticPerMonths: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    statisticPerSource: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    transaction: {
      aggregate: jest.fn().mockResolvedValue({
        _sum: { amount_converted: 0 },
        _count: { _all: 0 },
      }),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    },
    transactionsOnCategories: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount_converted: 0 } }),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
  parseId: jest.fn((id: unknown) => (id == null ? null : Number(id))),
  parseIdString: jest.fn((id: unknown) => (id == null ? null : String(id))),
}));

jest.mock("@/lib/dates", () => ({
  getUTCStartOfDate: jest.fn((d: Date) => d),
  getUTCStartOfDateString: jest.fn(() => "2024-01-01"),
}));

let schema: GraphQLSchema;

beforeAll(async () => {
  const mod = await import("@/graphql/schema");
  schema = mod.schema;
});

describe("schema GraphQL type", () => {
  it("schema builds contains Query type", () => {
    expect(schema).toBeInstanceOf(GraphQLSchema);
    const queryType = schema.getQueryType();
    expect(queryType?.name).toBe("Query");
  });

  it("contains Query.categories field", () => {
    const queryFields = schema.getQueryType()?.getFields() ?? {};
    expect(queryFields).toHaveProperty("categories");
  });

  it("contains Mutation.createCategory", () => {
    const mutationFields = schema.getMutationType()?.getFields() ?? {};
    expect(mutationFields).toHaveProperty("createCategory");
  });

  it("contains Query.rates and Query.currencies from currency type", () => {
    const queryFields = schema.getQueryType()?.getFields() ?? {};
    expect(queryFields).toHaveProperty("rates");
    expect(queryFields).toHaveProperty("currencies");
    expect(queryFields).toHaveProperty("rate_claims");
  });

  it("contains Query.transactionsStatistic from statistic type", () => {
    const queryFields = schema.getQueryType()?.getFields() ?? {};
    expect(queryFields).toHaveProperty("transactionsStatistic");
    expect(queryFields).toHaveProperty("transactionsStatisticPerMonths");
    expect(queryFields).toHaveProperty("transactionsStatisticPerSource");
  });

  it("contains Query.transactions from transaction type", () => {
    const queryFields = schema.getQueryType()?.getFields() ?? {};
    expect(queryFields).toHaveProperty("transactions");
    expect(queryFields).toHaveProperty("transactionsTotal");
  });

  it("contains Mutation.updateCategoriesForTransactions", () => {
    const mutationFields = schema.getMutationType()?.getFields() ?? {};
    expect(mutationFields).toHaveProperty("updateCategoriesForTransactions");
    expect(mutationFields).toHaveProperty("deleteCategoriesForTransactions");
    expect(mutationFields).toHaveProperty("updateCategoriesForAllTransactions");
  });

  it("introspection matches schema.graphql file structure", async () => {
    const schemaPath = path.resolve(
      process.cwd(),
      "app/graphql/schema.graphql",
    );
    expect(fs.existsSync(schemaPath)).toBe(true);
    const fileContent = fs.readFileSync(schemaPath, "utf-8");
    expect(fileContent).toContain("type Query");
    expect(fileContent).toContain("type Mutation");
    expect(fileContent).toContain("type Category");
    expect(fileContent).toContain("type Transaction");
    expect(fileContent).toContain("type CurrencyExchangeRate");

    const introspection = await graphql({
      schema,
      source: getIntrospectionQuery(),
    });
    expect(introspection.errors).toBeUndefined();
    const data = introspection.data as unknown as IntrospectionQuery;
    const rebuilt = buildClientSchema(data);
    const queryFields = rebuilt.getQueryType()?.getFields() ?? {};
    expect(queryFields).toHaveProperty("categories");
    expect(queryFields).toHaveProperty("transactions");
  });

  it("schema builds without errors implying side-effect imports registered types", () => {
    const typeMap = schema.getTypeMap();
    expect(typeMap).toHaveProperty("Category");
    expect(typeMap).toHaveProperty("Transaction");
    expect(typeMap).toHaveProperty("CurrencyExchangeRate");
    expect(typeMap).toHaveProperty("Statistic");
    expect(typeMap).toHaveProperty("Error");
  });
});
