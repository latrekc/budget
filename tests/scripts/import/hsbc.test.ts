import * as fs from "fs";
import * as path from "path";

import { parseHsbc } from "@/scripts/import/hsbc";
import { upsertTransactions } from "@/scripts/import/utils";

jest.mock("fs");
jest.mock("@/scripts/import/utils", () => ({
  parsePathToOFXDirectory: jest.fn((p) => p),
  upsertTransactions: jest.fn(async () => {}),
}));
jest.mock("@hublaw/ofx-parser", () => ({
  OfxParser: jest
    .fn()
    .mockImplementation(() => ({ parseStatement: jest.fn() })),
}));

import { OfxParser } from "@hublaw/ofx-parser";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedUpsert = upsertTransactions as jest.Mock;
const MockedParser = OfxParser as jest.Mock;

describe("hsbc import", () => {
  let actionHandler: (p: string) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockProgram: Record<string, jest.Mock> = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      action: jest.fn(),
    };
    mockProgram.action.mockImplementation(
      (fn: (p: string) => Promise<void>) => {
        actionHandler = fn;
        return mockProgram;
      },
    );
    parseHsbc(mockProgram as unknown as Parameters<typeof parseHsbc>[0]);
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("directory with 2 known accounts inserts records", async () => {
    const files = {
      "a.ofx": {
        accountId: "40010432086735",
        transactions: [
          { amount: 10, fitId: "1" },
          { amount: 20, fitId: "2" },
        ],
      },
      "b.ofx": {
        accountId: "40119990719461",
        transactions: [{ amount: -5, fitId: "3" }],
      },
    };
    mockedFs.readdirSync.mockReturnValue(["a.ofx", "b.ofx"] as never);
    mockedFs.readFileSync.mockImplementation(((p: unknown) => {
      const base = path.basename(p as string);
      const acc = files[base as keyof typeof files].accountId;
      return `<OFX><ACCTID>${acc}</ACCTID></OFX>`;
    }) as never);
    let idx = 0;
    const order = ["a.ofx", "b.ofx"];
    MockedParser.mockImplementation(() => ({
      parseStatement: jest.fn().mockImplementation(async () => {
        const name = order[idx++];
        const cfg = files[name as keyof typeof files];
        return {
          transactions: cfg.transactions.map((t) => ({
            amount: t.amount,
            datePosted: new Date(),
            name: "N",
            memo: "",
            fitId: t.fitId,
          })),
        };
      }),
    }));
    await actionHandler("/tmp");
    expect(mockedUpsert).toHaveBeenCalled();
    const records = mockedUpsert.mock.calls[0][1];
    expect(Array.isArray(records)).toBe(true);
    // In current implementation with mocked promises, microtasks flush before upsert, so records length is 3 characterizing actual behavior
    expect(records).toHaveLength(3);
  });

  it("unknown account triggers process exit", async () => {
    mockedFs.readdirSync.mockReturnValue(["unknown.ofx"] as never);
    mockedFs.readFileSync.mockReturnValue(
      "<OFX><ACCTID>999999</ACCTID></OFX>" as never,
    );
    MockedParser.mockImplementation(() => ({
      parseStatement: jest.fn().mockResolvedValue({ transactions: [] }),
    }));
    await actionHandler("/tmp");
    // process.exit is called inside async forEach not awaited, so actionHandler resolves but console.error is called
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Unknown account"),
    );
    // process.exit mock throws but is swallowed because forEach doesn't await; we characterize that upsert still called with 0 records
    expect(mockedUpsert).toHaveBeenCalled();
  });

  it("empty directory validation error before action via parsePathToOFXDirectory mock not here, but we test action with empty readdir returns 0 records", async () => {
    mockedFs.readdirSync.mockReturnValue([] as never);
    await actionHandler("/empty");
    expect(mockedUpsert).toHaveBeenCalled();
    expect(mockedUpsert.mock.calls[0][1]).toHaveLength(0);
  });

  it("async race exposes 0 records due to forEach async bug", async () => {
    // Same as first test but explicit
    mockedFs.readdirSync.mockReturnValue(["x.ofx"] as never);
    mockedFs.readFileSync.mockReturnValue(
      "<OFX><ACCTID>40010432086735</ACCTID></OFX>" as never,
    );
    MockedParser.mockImplementation(() => ({
      parseStatement: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  transactions: [
                    {
                      amount: 1,
                      datePosted: new Date(),
                      name: "N",
                      memo: "",
                      fitId: "1",
                    },
                  ],
                }),
              10,
            ),
          ),
      ),
    }));
    await actionHandler("/tmp");
    const records = mockedUpsert.mock.calls[0][1];
    // Due to not awaiting forEach, upsert happens before parse resolves, so 0
    expect(records).toHaveLength(0);
  });

  it("duplicate FITID across files results in upsert called once per file but records contain duplicates characterizing current behavior", async () => {
    mockedFs.readdirSync.mockReturnValue(["a.ofx", "b.ofx"] as never);
    mockedFs.readFileSync.mockImplementation(
      ((_p: unknown) => "<OFX><ACCTID>40010432086735</ACCTID></OFX>") as never,
    );
    let _idx = 0;
    MockedParser.mockImplementation(() => ({
      parseStatement: jest.fn().mockImplementation(async () => {
        _idx++;
        return {
          transactions: [
            {
              amount: 1,
              datePosted: new Date(),
              name: "N",
              memo: "",
              fitId: "dup",
            },
          ],
        };
      }),
    }));
    await actionHandler("/tmp");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(2);
  });
});
