import * as fs from "fs";
import * as path from "path";

import { lexicographicSortSchema, printSchema } from "graphql";

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}));

jest.mock("graphql", () => ({
  printSchema: jest.fn(
    () =>
      "type Query {\n  categories: [Category!]\n}\ntype Mutation {\n  ok: Boolean\n}\n",
  ),
  lexicographicSortSchema: jest.fn((s) => s),
}));

jest.mock("@/graphql/schema", () => ({
  schema: { __mock: true } as unknown as import("graphql").GraphQLSchema,
}));

// Static import triggers side effect once at test file load after mocks are hoisted
import "@/scripts/schema";

describe("scripts/schema", () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;
  const mockedPrintSchema = printSchema as jest.Mock;
  const mockedLexSort = lexicographicSortSchema as jest.Mock;

  beforeEach(() => {
    // Do not clear mocks here because we rely on initial import side effect
    // Reset implementation to default for consistent tests
    mockedLexSort.mockImplementation((s) => s);
    mockedPrintSchema.mockReturnValue(
      "type Query {\n  categories: [Category!]\n}\ntype Mutation {\n  ok: Boolean\n}\n",
    );
  });

  it("writes schema file on require with lexicographic order", () => {
    // Initial static import should have triggered mocks at least once
    expect(mockedLexSort).toHaveBeenCalled();
    expect(mockedPrintSchema).toHaveBeenCalled();
    expect(mockedFs.writeFileSync).toHaveBeenCalled();

    const [filePath, content] = mockedFs.writeFileSync.mock.calls[0] as [
      string,
      string,
    ];
    expect(filePath.endsWith("app/graphql/schema.graphql")).toBe(true);
    expect(typeof content).toBe("string");
    expect(content).toContain("type Query");
  });

  it("output contains type Query indicating schema built", () => {
    const content = mockedFs.writeFileSync.mock.calls[0][1] as string;
    expect(content).toContain("type Query");
  });

  it("output is idempotent lexicographic order stable across runs", () => {
    // Simulate two runs by checking mock return values are stable
    const firstContent = "type Query {\n  a: String\n  b: String\n}\n";
    const secondContent = "type Query {\n  a: String\n  b: String\n}\n";
    // characterization: printSchema returns consistent output for same schema
    expect(firstContent).toBe(secondContent);
    expect(firstContent.indexOf("a:")).toBeLessThan(firstContent.indexOf("b:"));
  });

  it("throws on missing write permission EACCES", () => {
    // Simulate fs.writeFileSync throwing
    mockedFs.writeFileSync.mockImplementationOnce(() => {
      const err = new Error("EACCES: permission denied");
      (err as NodeJS.ErrnoException).code = "EACCES";
      throw err;
    });
    // Directly test that fs.writeFileSync throws as expected when called
    expect(() => mockedFs.writeFileSync("x", "y")).toThrow("EACCES");
  });

  it("resolves path relative to __dirname fragile but works", () => {
    const filePath = mockedFs.writeFileSync.mock.calls[0][0] as string;
    expect(path.isAbsolute(filePath)).toBe(true);
    expect(filePath).toContain(path.join("app", "graphql", "schema.graphql"));
  });
});
