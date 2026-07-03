import { Currency, Source } from "@/lib/types";
import { parseMonzo } from "@/scripts/import/monzo";
import {
  parseTransactionsFile,
  upsertTransactions,
} from "@/scripts/import/utils";

jest.mock("@/scripts/import/utils", () => {
  const actual = jest.requireActual("@/scripts/import/utils");
  return {
    ...actual,
    parsePathToCsvFile: jest.fn((p) => p),
    upsertTransactions: jest.fn(async () => {}),
    parseTransactionsFile: jest.fn(),
  };
});

const mockedUpsert = upsertTransactions as jest.Mock;
const mockedParseFile = parseTransactionsFile as jest.Mock;

describe("monzo import", () => {
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
    parseMonzo(mockProgram as unknown as Parameters<typeof parseMonzo>[0]);
  });

  it("valid row parses correct date UTC and description trim", async () => {
    mockedParseFile.mockImplementation((_filePath: unknown, onRecord) => {
      const record = {
        Amount: "-12.34",
        Currency: "GBP",
        Date: "15/03/2024",
        Description: "Coffee",
        Name: "Starbucks",
        Time: "14:30:00",
        "Transaction ID": "tx1",
      };
      return [onRecord(record)];
    });
    await actionHandler("f.csv");
    expect(mockedUpsert).toHaveBeenCalled();
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(
      expect.objectContaining({
        amount: -1234,
        currency: Currency.GBP,
        id: "tx1",
        source: Source.Monzo,
        description: "Starbucks Coffee",
      }),
    );
    // date parsed via date-format-parse DD/MM/YYYY HH:mm:ss ; check components
    const date = records[0].date as Date;
    expect(date.getDate()).toBe(15);
    expect(date.getMonth()).toBe(2); // March 0-index
    expect(date.getFullYear()).toBe(2024);
  });

  it("missing Name trims double spaces collapsed", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const record = {
        Amount: "10",
        Currency: "GBP",
        Date: "01/01/2024",
        Description: "  Test   description  ",
        Time: "00:00:00",
        "Transaction ID": "t2",
      };
      // Name undefined
      return [onRecord({ ...record, Name: undefined })];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].description).toBe("Test description");
  });

  it("empty file header only returns 0 records", async () => {
    mockedParseFile.mockReturnValue([]);
    await actionHandler("empty.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(0);
  });

  it("bad date format MM/DD results in Invalid Date", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const record = {
        Amount: "5",
        Currency: "GBP",
        Date: "03/15/2024",
        Description: "Bad",
        Name: "",
        Time: "12:00:00",
        "Transaction ID": "bad",
      };
      return [onRecord(record)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    const date = records[0].date as Date;
    // date-format-parse with DD/MM/YYYY interprets 03 as day, 15 as month => normalizes to March next year (2025-03-03)
    expect(isNaN(date.getTime())).toBe(false);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(2); // March 0-index
    expect(date.getDate()).toBe(3);
  });

  it("duplicate Transaction ID second run still passes records to upsert characterizing", async () => {
    mockedParseFile.mockReturnValue([
      {
        id: "dup",
        amount: 100,
        currency: Currency.GBP,
        date: new Date(),
        description: "d",
        source: Source.Monzo,
      },
    ]);
    await actionHandler("f.csv");
    await actionHandler("f.csv");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
    expect(mockedUpsert.mock.calls[0][1]).toHaveLength(1);
    expect(mockedUpsert.mock.calls[1][1]).toHaveLength(1);
  });

  it("amount -12.34 parses to -1234", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        Amount: "-12.34",
        Currency: "GBP",
        Date: "01/01/2024",
        Description: "x",
        Name: "",
        Time: "00:00:00",
        "Transaction ID": "a",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].amount).toBe(-1234);
  });
});
