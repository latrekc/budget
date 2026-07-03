import { Currency, Source } from "@/lib/types";
import { parseTinkoff } from "@/scripts/import/tinkoff";
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

describe("tinkoff import", () => {
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
    parseTinkoff(mockProgram as unknown as Parameters<typeof parseTinkoff>[0]);
  });

  it("cp1251 decode semicolon split parses Cyrillic correctly", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord, opts) => {
      expect(opts?.customEncoding).toBe("cp1251");
      expect(opts?.delimiter).toBe(";");
      const rec = {
        "Сумма операции": "100.5",
        "Валюта операции": "RUB",
        "Дата операции": "15.03.2024",
        Описание: "Тест",
        Статус: "OK",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].amount).toBe(10050);
    expect(records[0].currency).toBe(Currency.RUB);
    expect(records[0].description).toBe("Тест");
  });

  it("amount comma decimal edge parses incorrectly due to parseFloat", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        "Сумма операции": "123,45",
        "Валюта операции": "RUB",
        "Дата операции": "01.01.2024",
        Описание: "x",
        Статус: "OK",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].amount).toBe(12300); // bug
  });

  it("status FAILED still imported characterizing current behavior", async () => {
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        "Сумма операции": "10",
        "Валюта операции": "RUB",
        "Дата операции": "01.01.2024",
        Описание: "failed",
        Статус: "FAILED",
      };
      return [onRecord(rec)];
    });
    await actionHandler("f.csv");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0].description).toBe("failed");
  });

  it("duplicate run idempotent characterizing via upsert called twice", async () => {
    mockedParseFile.mockReturnValue([
      {
        id: "dup",
        amount: 100,
        currency: Currency.RUB,
        date: new Date(),
        description: "d",
        source: Source.Tinkoff,
      },
    ]);
    await actionHandler("f.csv");
    await actionHandler("f.csv");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
  });
});
