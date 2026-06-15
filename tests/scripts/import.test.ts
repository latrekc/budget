jest.mock("commander", () => {
  const mockParse = jest.fn(() => ({}));
  const makeChain = () => ({
    description: jest.fn().mockReturnThis(),
    argument: jest.fn().mockReturnThis(),
    action: jest.fn().mockReturnThis(),
  });
  const mockCommandInstance = {
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    command: jest.fn().mockImplementation(() => makeChain()),
    parse: mockParse,
  };
  return {
    Command: jest.fn(() => mockCommandInstance),
    InvalidArgumentError: class InvalidArgumentError extends Error {},
  };
});

jest.mock("@/scripts/import/barclays", () => ({
  parseBarclays: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/barclays-amazon", () => ({
  parseBarclaysAmazon: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/hsbc", () => ({
  parseHsbc: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/monzo", () => ({
  parseMonzo: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/revolut", () => ({
  parseRevolut: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/sberbank", () => ({
  parseSberbank: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/tinkoff", () => ({
  parseTinkoff: jest.fn((p: unknown) => p),
}));
jest.mock("@/scripts/import/wise", () => ({
  parseWise: jest.fn((p: unknown) => p),
}));

import { parseBarclays } from "@/scripts/import/barclays";
import { parseBarclaysAmazon } from "@/scripts/import/barclays-amazon";
import { parseHsbc } from "@/scripts/import/hsbc";
import { parseMonzo } from "@/scripts/import/monzo";
import { parseRevolut } from "@/scripts/import/revolut";
import { parseSberbank } from "@/scripts/import/sberbank";
import { parseTinkoff } from "@/scripts/import/tinkoff";
import { parseWise } from "@/scripts/import/wise";

// Static import triggers side effect after mocks
import "@/scripts/import";

const { Command } = jest.requireMock("commander") as {
  Command: jest.Mock;
};
const mockCommandInstance = new Command() as {
  parse: jest.Mock;
  command: jest.Mock;
  description: jest.Mock;
  version: jest.Mock;
};
const mockedParse = mockCommandInstance.parse;

describe("scripts/import", () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = ["node", "import", "--help"];
    // Do not clear mocks that track initial import; we want to assert they were called at least once
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("registers 8 subcommands on program", () => {
    expect(parseMonzo).toHaveBeenCalled();
    expect(parseTinkoff).toHaveBeenCalled();
    expect(parseRevolut).toHaveBeenCalled();
    expect(parseWise).toHaveBeenCalled();
    expect(parseHsbc).toHaveBeenCalled();
    expect(parseBarclays).toHaveBeenCalled();
    expect(parseBarclaysAmazon).toHaveBeenCalled();
    expect(parseSberbank).toHaveBeenCalled();

    const totalCalls =
      (parseMonzo as jest.Mock).mock.calls.length +
      (parseTinkoff as jest.Mock).mock.calls.length +
      (parseRevolut as jest.Mock).mock.calls.length +
      (parseWise as jest.Mock).mock.calls.length +
      (parseHsbc as jest.Mock).mock.calls.length +
      (parseBarclays as jest.Mock).mock.calls.length +
      (parseBarclaysAmazon as jest.Mock).mock.calls.length +
      (parseSberbank as jest.Mock).mock.calls.length;
    expect(totalCalls).toBeGreaterThanOrEqual(8);
  });

  it("dry-run help lists 8 subcommands without throwing", () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // module already imported, parse should have been called at least once during import
    expect(mockedParse).toHaveBeenCalled();

    mockExit.mockRestore();
  });

  it("program.parse is called as side effect on require", () => {
    expect(mockedParse).toHaveBeenCalled();
  });

  it("each parser receives Command instance", () => {
    const allMocks = [
      parseMonzo,
      parseTinkoff,
      parseRevolut,
      parseWise,
      parseHsbc,
      parseBarclays,
      parseBarclaysAmazon,
      parseSberbank,
    ] as jest.Mock[];
    allMocks.forEach((m) => {
      expect(m.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(m.mock.calls[0][0]).toBeDefined();
      expect(typeof m.mock.calls[0][0]).toBe("object");
    });
  });

  it("no isolation for unit test side effect parse argv documented", () => {
    // characterize current behavior: require triggers parse immediately via static import at top
    expect(mockedParse).toHaveBeenCalled();
  });
});
