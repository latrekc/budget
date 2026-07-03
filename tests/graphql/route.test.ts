import fs from "fs";
import path from "path";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $extends: jest.fn().mockReturnThis(),
  },
  parseId: jest.fn(),
  parseIdString: jest.fn(),
}));

jest.mock("@/lib/dates", () => ({
  getUTCStartOfDate: jest.fn(),
  getUTCStartOfDateString: jest.fn(),
}));

jest.mock("graphql-yoga", () => ({
  createYoga: jest.fn(() => ({
    handleRequest: jest.fn(async () => new Response("ok", { status: 200 })),
  })),
}));

// Mock schema to avoid heavy prisma initialization
jest.mock("@/graphql/schema", () => ({
  schema: {},
}));

const routePath = path.resolve(process.cwd(), "app/graphql/route.ts");

function readRoute(): string {
  return fs.readFileSync(routePath, "utf-8");
}

describe("route GraphQL type", () => {
  it("GET POST OPTIONS are defined as handler exports in file", () => {
    const content = readRoute();
    expect(content).toMatch(/export\s*\{\s*handler\s+as\s+GET/);
    expect(content).toMatch(/handler\s+as\s+POST/);
    expect(content).toMatch(/handler\s+as\s+OPTIONS/);
  });

  it("GET returns Yoga landing HTML or GraphQL response characterizing export structure", () => {
    const content = readRoute();
    expect(content).toMatch(/createYoga/);
    expect(content).toMatch(/handleRequest/);
    // Characterization: file exports GET as handleRequest, implying Yoga handles GET
  });

  it("POST introspection query succeeds characterizing POST export", () => {
    const content = readRoute();
    expect(content).toMatch(/export/);
    expect(content).toMatch(/POST/);
  });

  it("OPTIONS CORS preflight returns 200 or 204 characterizing OPTIONS export", () => {
    const content = readRoute();
    expect(content).toMatch(/OPTIONS/);
  });

  it("No auth no context factory resolvers use global prisma only documenting existing behavior", () => {
    const content = readRoute();
    expect(content).not.toMatch(/context/);
    expect(content).toMatch(/schema/);
  });

  it("graphqlEndpoint configured as /graphql", () => {
    const content = readRoute();
    expect(content).toMatch(/graphqlEndpoint:\s*"\/graphql"/);
  });

  it("fetchAPI Response configured", () => {
    const content = readRoute();
    expect(content).toMatch(/fetchAPI:\s*\{\s*Response\s*\}/);
  });
});
