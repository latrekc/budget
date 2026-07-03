import * as fs from "fs";

import { Currency, Source } from "@/lib/types";
import { parseSberbank } from "@/scripts/import/sberbank";
import {
  parseTransactionsFile,
  upsertTransactions,
} from "@/scripts/import/utils";

jest.mock("fs");
jest.mock("@/scripts/import/utils", () => {
  const actual = jest.requireActual("@/scripts/import/utils");
  return {
    ...actual,
    parsePathToCSVDirectory: jest.fn((p) => p),
    upsertTransactions: jest.fn(async () => {}),
    parseTransactionsFile: jest.fn((filePath, onRecord, options) => {
      // simulate actual parseTransactionsFile behavior for our tests using actual implementation but we mock to control
      const actualImpl = jest.requireActual(
        "@/scripts/import/utils",
      ).parseTransactionsFile;
      // We'll use actual for simplicity if file exists, but in tests we mock return values directly per test via custom mockImplementation override in test setup.
      return actualImpl(filePath, onRecord, options);
    }),
  };
});

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedUpsert = upsertTransactions as jest.Mock;
const mockedParseFile = parseTransactionsFile as jest.Mock;

describe("sberbank import", () => {
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
    parseSberbank(
      mockProgram as unknown as Parameters<typeof parseSberbank>[0],
    );
  });

  it("utf-8 semicolon valid parses records", async () => {
    mockedFs.readdirSync.mockReturnValue(["a.csv"] as never);
    mockedParseFile.mockImplementation((_fp: unknown, onRecord, opts) => {
      expect(opts?.delimiter).toBe(";");
      const rec = {
        "Сумма в валюте операции": "100.5",
        "Сумма в валюте счета": "",
        "Валюта операции": "USD",
        "Дата совершения операции": "15.03.2024",
        Описание: "Test",
      };
      return [onRecord(rec)];
    });
    await actionHandler("/tmp");
    expect(mockedUpsert).toHaveBeenCalled();
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0].amount).toBe(10050);
    expect(records[0].currency).toBe(Currency.USD);
  });

  it("cp1251 file without encoding option results in mojibake characterizing current behavior expecting failure if not specified but code uses default utf-8", async () => {
    // In actual code, sberbank uses default utf-8 (no customEncoding), so cp1251 would mojibake. We characterize that parseTransactionsFile without encoding would misread.
    // Our mock simulates correct behavior when encoding specified, but sberbank code does NOT specify customEncoding, so we test that default path leads to wrong parsing.
    // We'll simulate by having mockedParseFile return mojibake string when called without encoding.
    mockedFs.readdirSync.mockReturnValue(["b.csv"] as never);
    mockedParseFile.mockImplementation((_fp: unknown, onRecord, opts) => {
      // opts undefined => default utf-8, so Cyrillic would be mojibake, but we simulate returning record with garbled description
      expect(opts?.delimiter).toBe(";");
      expect(opts?.customEncoding).toBeUndefined();
      const rec = {
        "Сумма в валюте операции": "10",
        "Сумма в валюте счета": "",
        "Валюта операции": "RUB",
        "Дата совершения операции": "01.01.2024",
        Описание: "РўРµСЃС‚",
      }; // mojibake for "Тест"
      return [onRecord(rec)];
    });
    await actionHandler("/tmp");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].description).toBe("РўРµСЃС‚"); // mojibake, characterizing bug
  });

  it('amount "123,45" parses to 12300 due to parseFloat bug catching', async () => {
    mockedFs.readdirSync.mockReturnValue(["c.csv"] as never);
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        "Сумма в валюте операции": "123,45",
        "Сумма в валюте счета": "",
        "Валюта операции": "RUB",
        "Дата совершения операции": "01.01.2024",
        Описание: "x",
      };
      return [onRecord(rec)];
    });
    await actionHandler("/tmp");
    const records = mockedUpsert.mock.calls[0][1];
    // parseFloat("123,45") => 123, *100 =>12300, expected 12345 but bug gives 12300
    expect(records[0].amount).toBe(12300);
  });

  it("empty operation currency falls back to RUB", async () => {
    mockedFs.readdirSync.mockReturnValue(["d.csv"] as never);
    mockedParseFile.mockImplementation((_fp: unknown, onRecord) => {
      const rec = {
        "Сумма в валюте операции": "",
        "Сумма в валюте счета": "50",
        "Валюта операции": "",
        "Дата совершения операции": "01.01.2024",
        Описание: "y",
      };
      return [onRecord(rec)];
    });
    await actionHandler("/tmp");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].currency).toBe(Currency.RUB);
    expect(records[0].amount).toBe(5000);
  });

  it("duplicate hash second run still calls upsert characterizing", async () => {
    mockedFs.readdirSync.mockReturnValue(["e.csv"] as never);
    mockedParseFile.mockReturnValue([
      {
        id: "dup",
        amount: 100,
        currency: Currency.RUB,
        date: new Date(),
        description: "d",
        source: Source.Sberbank,
      },
    ]);
    await actionHandler("/tmp");
    await actionHandler("/tmp");
    expect(mockedUpsert).toHaveBeenCalledTimes(2);
  });
});
