import { Currency, Source } from "@/lib/types";
import {
  parseTransactionsFile,
  upsertTransactions,
} from "@/scripts/import/utils";
import { parseWise } from "@/scripts/import/wise";

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

describe("wise import", () => {
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
    parseWise(mockProgram as unknown as Parameters<typeof parseWise>[0]);
  });

  it("valid inserts records with id suffix currency", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        Amount: "12.34",
        Currency: "USD",
        Date: "15-03-2024",
        Description: "Test",
        "TransferWise ID": "tw1",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(
      expect.objectContaining({
        amount: 1234,
        currency: Currency.USD,
        id: "tw1-USD",
        source: Source.Wise,
      }),
    );
  });

  it("duplicate ID currency second run still calls upsert", async () => {
    mockedParseFile.mockReturnValue([
      {
        id: "tw1-USD",
        amount: 100,
        currency: Currency.USD,
        date: new Date(),
        description: "d",
        source: Source.Wise,
      },
    ]);
    await actionHandler("f.csv");
    await actionHandler("f.csv");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
  });

  it("different currency same ID results distinct id", async () => {
    mockedParseFile
      .mockImplementationOnce((_fp: unknown, onRecord) => [
        onRecord({
          Amount: "1",
          Currency: "USD",
          Date: "01-01-2024",
          Description: "x",
          "TransferWise ID": "same",
        }),
      ])
      .mockImplementationOnce((_fp: unknown, onRecord) => [
        onRecord({
          Amount: "1",
          Currency: "EUR",
          Date: "01-01-2024",
          Description: "x",
          "TransferWise ID": "same",
        }),
      ]);
    await actionHandler("f1.csv");
    await actionHandler("f2.csv");
    const id1 = mockedUpsert.mock.calls[0][1][0].id;
    const id2 = mockedUpsert.mock.calls[1][1][0].id;
    expect(id1).toBe("same-USD");
    expect(id2).toBe("same-EUR");
    expect(id1).not.toBe(id2);
  });

  it("bad date format results in Invalid Date", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => [
      onRecord({
        Amount: "1",
        Currency: "GBP",
        Date: "2024/03/15",
        Description: "x",
        "TransferWise ID": "b",
      }),
    ]);
    await actionHandler("f.csv");
    const date = mockedUpsert.mock.calls[0][1][0].date as Date;
    expect(isNaN(date.getTime())).toBe(true);
  });

  it("empty Amount results in NaN amount", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => [
      onRecord({
        Amount: "",
        Currency: "GBP",
        Date: "15-03-2024",
        Description: "x",
        "TransferWise ID": "e",
      }),
    ]);
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(isNaN(records[0].amount)).toBe(true);
  });
});
