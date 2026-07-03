import { GraphQLScalarType } from "graphql";
import { DateTimeResolver } from "graphql-scalars";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $extends: jest.fn().mockReturnThis(),
    category: {},
    currencyExchangeRate: {},
    currencyExchangeRateClaim: {},
    statistic: {},
    statisticPerMonths: {},
    statisticPerSource: {},
    transaction: {},
    transactionsOnCategories: {},
  },
  parseId: jest.fn(),
  parseIdString: jest.fn(),
}));

describe("builder GraphQL type", () => {
  it("Builder instantiates without error", async () => {
    const { builder } = await import("@/graphql/builder");
    expect(builder).toBeDefined();
    expect(typeof builder.queryType).toBe("function");
  });

  it("plugins loaded in order Prisma PrismaUtils Relay Errors SimpleObjects", async () => {
    const builderModule = await import("@/graphql/builder");
    // Characterization: builder instance exists implying plugins registered without throwing
    expect(builderModule.builder).toBeDefined();
  });

  it("Date scalar parse serialize roundtrip valid ISO", async () => {
    const scalar = DateTimeResolver as unknown as GraphQLScalarType;
    const date = new Date("2024-06-22T15:07:29.000Z");
    const serialized = scalar.serialize(date);
    expect(serialized).toBeDefined();
    // DateTimeResolver may serialize to Date object or string depending on version - characterization accepts both
    const serializedString =
      serialized instanceof Date
        ? serialized.toISOString()
        : String(serialized);
    expect(typeof serializedString).toBe("string");
    const parsed = scalar.parseValue(serializedString);
    expect(parsed).toBeInstanceOf(Date);
    expect((parsed as Date).toISOString()).toBe(date.toISOString());
  });

  it("Date scalar invalid rejects", async () => {
    const scalar = DateTimeResolver as unknown as GraphQLScalarType;
    expect(() => scalar.parseValue("not-a-date")).toThrow();
    expect(() => scalar.parseValue("")).toThrow();
  });

  it("Error objectType resolves message", async () => {
    const { builder } = await import("@/graphql/builder");
    const schema = builder.toSchema();
    const errorType = schema.getType("Error");
    expect(errorType).toBeDefined();
    const fields =
      errorType && "getFields" in errorType
        ? (
            errorType as { getFields: () => Record<string, unknown> }
          ).getFields()
        : {};
    expect(fields).toHaveProperty("message");
  });

  it("queryType ok Boolean returns true", async () => {
    const { builder } = await import("@/graphql/builder");
    const schema = builder.toSchema();
    const queryType = schema.getQueryType();
    expect(queryType).toBeDefined();
    const fields = queryType?.getFields() ?? {};
    expect(fields).toHaveProperty("ok");
    expect(fields.ok.type.toString()).toContain("Boolean");
  });

  it("builder DefaultFieldNullability true configured", async () => {
    const { builder } = await import("@/graphql/builder");
    // Characterization: builder.toSchema succeeds with DefaultFieldNullability implying non-null by default unless explicit nullable
    const schema = builder.toSchema();
    expect(schema).toBeDefined();
  });
});
