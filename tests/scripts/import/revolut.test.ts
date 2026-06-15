import { parseRevolut } from "@/scripts/import/revolut";
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

describe("revolut import", () => {
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
    parseRevolut(mockProgram as unknown as Parameters<typeof parseRevolut>[0]);
  });

  it("duplicate file run results in same hash 0 new characterizing via upsert mock called twice", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        Amount: "10",
        Currency: "GBP",
        Description: "Test",
        "Started Date": "2024-01-01 10:00:00",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    await actionHandler("f.csv");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
    const id1 = mockedUpsert.mock.calls[0][1][0].id;
    const id2 = mockedUpsert.mock.calls[1][1][0].id;
    expect(id1).toBe(id2); // same hash => duplicate
  });

  it("slight description change results in new id", async () => {
    mockedParseFile
      .mockImplementationOnce((_fp: unknown, onRecord) => {
        return [
          onRecord({
            Amount: "10",
            Currency: "GBP",
            Description: "Test",
            "Started Date": "2024-01-01 10:00:00",
          }),
        ];
      })
      .mockImplementationOnce((_fp: unknown, onRecord) => {
        return [
          onRecord({
            Amount: "10",
            Currency: "GBP",
            Description: "Test changed",
            "Started Date": "2024-01-01 10:00:00",
          }),
        ];
      });
    await actionHandler("f.csv");
    await actionHandler("f.csv");
    const id1 = mockedUpsert.mock.calls[0][1][0].id;
    const id2 = mockedUpsert.mock.calls[1][1][0].id;
    expect(id1).not.toBe(id2);
  });

  it("invalid date results in Invalid Date object characterizing", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      return [
        onRecord({
          Amount: "5",
          Currency: "GBP",
          Description: "x",
          "Started Date": "invalid-date",
        }),
      ];
    });
    await actionHandler("f.csv");
    const date = mockedUpsert.mock.calls[0][1][0].date as Date;
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('amount "1,234.56" parses to 1 due to parseFloat bug', async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      return [
        onRecord({
          Amount: "1,234.56",
          Currency: "GBP",
          Description: "x",
          "Started Date": "2024-01-01 00:00:00",
        }),
      ];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    // parseFloat stops at comma => 1 => *100 =>100
    expect(records[0].amount).toBe(100);
  });
});
