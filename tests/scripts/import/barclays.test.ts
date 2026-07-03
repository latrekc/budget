import { Command } from "commander";
import * as fs from "fs";

import { Currency, Source } from "@/lib/types";
import { parseBarclays } from "@/scripts/import/barclays";
import { upsertTransactions } from "@/scripts/import/utils";

jest.mock("fs");
jest.mock("@/scripts/import/utils", () => ({
  parsePathToOfxFile: jest.fn((p) => p),
  upsertTransactions: jest.fn(async () => {}),
}));
jest.mock("@hublaw/ofx-parser", () => ({
  OfxParser: jest.fn().mockImplementation(() => ({
    parseStatement: jest.fn(),
  })),
}));

import { OfxParser } from "@hublaw/ofx-parser";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedUpsert = upsertTransactions as jest.Mock;
const MockedParser = OfxParser as jest.Mock;

describe("barclays import", () => {
  let actionHandler: (path: string) => Promise<void>;
  let mockProgram: Partial<Command>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2024-06-01T12:00:00Z"));
    mockProgram = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      action: jest.fn((fn) => {
        actionHandler = fn;
        return mockProgram as Command;
      }),
    } as unknown as Partial<Command>;
    parseBarclays(mockProgram as Command);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mockOfx(
    transactions: Array<
      Partial<{
        amount: number;
        datePosted: Date;
        name: string;
        memo: string;
        fitId: string;
      }>
    >,
    content: string,
  ) {
    mockedFs.readFileSync.mockReturnValue(content as never);
    const mockInstance = {
      parseStatement: jest.fn().mockResolvedValue({ transactions }),
    };
    MockedParser.mockImplementation(() => mockInstance);
  }

  it("valid ofx with 3 transactions inserts 3 records", async () => {
    const content = "<OFX><CURDEF>USD</CURDEF></OFX>";
    mockOfx(
      [
        {
          amount: 10.5,
          datePosted: new Date("2024-01-01"),
          name: "A",
          memo: "B",
          fitId: "1",
        },
        {
          amount: -5.25,
          datePosted: new Date("2024-01-02"),
          name: "C",
          memo: "",
          fitId: "2",
        },
        {
          amount: 0,
          datePosted: new Date("2024-01-03"),
          name: "D",
          memo: "E",
          fitId: "3",
        },
      ],
      content,
    );
    await actionHandler("dummy.ofx");
    expect(mockedUpsert).toHaveBeenCalledTimes(1);
    const [source, records] = mockedUpsert.mock.calls[0];
    expect(source).toBe(Source.Barclays);
    expect(records).toHaveLength(3);
    expect(records[0]).toEqual(
      expect.objectContaining({
        amount: 1050,
        currency: Currency.USD,
        id: "1",
        description: "A B",
        source: Source.Barclays,
      }),
    );
    expect(records[1].amount).toBe(-525);
    expect(records[2].amount).toBe(0);
  });

  it("missing CURDEF defaults to GBP", async () => {
    const content = "<OFX></OFX>";
    mockOfx(
      [{ amount: 1, datePosted: new Date(), name: "N", memo: "M", fitId: "x" }],
      content,
    );
    await actionHandler("p.ofx");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].currency).toBe(Currency.GBP);
  });

  it("missing FITID results in empty string id", async () => {
    const content = "<OFX><CURDEF>GBP</CURDEF></OFX>";
    mockOfx(
      [{ amount: 2, datePosted: new Date(), name: "N", memo: "" }],
      content,
    ); // no fitId
    await actionHandler("p.ofx");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].id).toBe("");
  });

  it("missing DTMPOSTED falls back to now", async () => {
    const content = "<OFX></OFX>";
    mockOfx([{ amount: 3, name: "A", memo: "B", fitId: "f" }], content); // no datePosted
    await actionHandler("p.ofx");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].date).toEqual(new Date("2024-06-01T12:00:00Z"));
  });

  it("malformed OFX throws", async () => {
    mockedFs.readFileSync.mockReturnValue("<bad>" as never);
    const mockInstance = {
      parseStatement: jest.fn().mockRejectedValue(new Error("parse fail")),
    };
    MockedParser.mockImplementation(() => mockInstance);
    await expect(actionHandler("bad.ofx")).rejects.toThrow("parse fail");
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("duplicate FITID second run still calls upsert with same records characterizing current behavior", async () => {
    const content = "<OFX></OFX>";
    mockOfx(
      [
        {
          amount: 1,
          datePosted: new Date(),
          name: "A",
          memo: "",
          fitId: "dup",
        },
      ],
      content,
    );
    await actionHandler("p.ofx");
    await actionHandler("p.ofx");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
    // upsertTransactions handles duplicate via DB upsert, here we just verify records passed both times length 1
    expect(mockedUpsert.mock.calls[0][1]).toHaveLength(1);
    expect(mockedUpsert.mock.calls[1][1]).toHaveLength(1);
  });
});
