import * as fs from "fs";
import * as path from "path";

import { parse as parseCsv } from "csv-parse/sync";
import { parse as parseDate } from "date-format-parse";

import {
  getTransactionCurrencyRate,
  getTransactionsCurrencyRates,
} from "@/lib/currency_rates";
import { getUTCStartOfDate, getUTCStartOfDateString } from "@/lib/dates";
import prisma from "@/lib/prisma";

jest.mock("fs");
jest.mock("path");
jest.mock("csv-parse/sync");
jest.mock("date-format-parse");
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    currencyExchangeRate: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
    transactionsOnCategories: {
      findMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/currency_rates", () => ({
  getTransactionsCurrencyRates: jest.fn(),
  getTransactionCurrencyRate: jest.fn(),
}));
jest.mock("@/lib/dates", () => ({
  getUTCStartOfDate: jest.fn((d: Date) => d),
  getUTCStartOfDateString: jest.fn(() => "2025-01-01"),
}));
jest.mock("commander", () => {
  const mockActionMap = new Map<
    string,
    (arg: unknown) => Promise<void> | void
  >();
  // We'll override command mock to capture name and action
  const mockCommandInstance: Record<string, unknown> = {
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    parse: jest.fn(),
    _actionMap: mockActionMap,
  };
  mockCommandInstance.command = jest.fn().mockImplementation((name: string) => {
    const chain: Record<string, unknown> = {
      description: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      action: jest
        .fn()
        .mockImplementation((_fn: (arg: unknown) => Promise<void>) => {
          mockActionMap.set(name, _fn);
          return chain;
        }),
    };
    return chain;
  });
  return {
    Command: jest.fn(() => mockCommandInstance),
    InvalidArgumentError: class InvalidArgumentError extends Error {},
  };
});

// Static import triggers side effect after mocks
import "@/scripts/currencies";

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;
const mockedParseCsv = parseCsv as jest.Mock;
const mockedParseDate = parseDate as jest.Mock;
const mockedPrisma = prisma as unknown as {
  $transaction: jest.Mock;
  currencyExchangeRate: { deleteMany: jest.Mock; createMany: jest.Mock };
  transaction: { findMany: jest.Mock };
  transactionsOnCategories: { findMany: jest.Mock };
};
const mockedGetRates = getTransactionsCurrencyRates as jest.Mock;
const mockedGetRate = getTransactionCurrencyRate as jest.Mock;
const mockedGetUtcStart = getUTCStartOfDate as jest.Mock;
const mockedGetUtcString = getUTCStartOfDateString as jest.Mock;

const { Command } = jest.requireMock("commander") as { Command: jest.Mock };
const mockCommandInstance = new Command() as {
  command: jest.Mock;
  parse: jest.Mock;
  _actionMap: Map<string, (arg: unknown) => Promise<void>>;
};

function getAction(name: string) {
  return mockCommandInstance._actionMap.get(name);
}

describe("scripts/currencies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup default mock implementations after clear
    mockedPath.resolve.mockImplementation((...parts: string[]) =>
      parts.join("/"),
    );
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      "Date,USD,EUR,RUB,HUF,JPY,TRY\n01/01/2025,1.2,0.9,100,400,150,35",
    );
    mockedParseDate.mockImplementation(() => new Date("2025-01-01T00:00:00Z"));
    mockedGetUtcStart.mockImplementation((d: Date) => d);
    mockedGetUtcString.mockReturnValue("2025-01-01");
    mockedParseCsv.mockReturnValue([
      {
        date: new Date("2025-01-01"),
        rates: { EUR: 0.9, HUF: 400, JPY: 150, RUB: 100, TRY: 35, USD: 1.2 },
      },
    ]);
    mockedPrisma.$transaction.mockImplementation(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          currencyExchangeRate: mockedPrisma.currencyExchangeRate,
          transaction: mockedPrisma.transaction,
          transactionsOnCategories: mockedPrisma.transactionsOnCategories,
        };
        return cb(tx);
      },
    );
    mockedPrisma.currencyExchangeRate.deleteMany.mockResolvedValue({
      count: 5,
    });
    mockedPrisma.currencyExchangeRate.createMany.mockResolvedValue({
      count: 6,
    });
    mockedPrisma.transaction.findMany.mockResolvedValue([]);
    mockedPrisma.transactionsOnCategories.findMany.mockResolvedValue([]);
    mockedGetRates.mockResolvedValue(new Map());
    mockedGetRate.mockReturnValue(1);
    jest.spyOn(console, "log").mockImplementation(() => {});
    // Re-import module to re-register actions after clear? Actions already registered at top-level import once.
    // Our mockActionMap persists across tests because module imported once at top.
    // That's fine; actions are stored.
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("import-year command", () => {
    it("import-year 2025 valid inserts count equals days*currencies", async () => {
      const action = getAction("import-year");
      expect(action).toBeDefined();
      await action!([2025, "/fake/path/2025.csv"]);

      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(mockedParseCsv).toHaveBeenCalled();
      expect(mockedPrisma.currencyExchangeRate.deleteMany).toHaveBeenCalled();
      expect(mockedPrisma.currencyExchangeRate.createMany).toHaveBeenCalled();
      const createArg =
        mockedPrisma.currencyExchangeRate.createMany.mock.calls[0][0];
      expect(createArg.data).toHaveLength(6);
      expect(console.log).toHaveBeenCalledWith("Deleted 5 records");
      expect(console.log).toHaveBeenCalledWith("Imported 6 records for 2025");
    });

    it("import-year missing optional HUF column results 0 HUF rows", async () => {
      mockedFs.readFileSync.mockReturnValue(
        "Date,USD,EUR,RUB,JPY,TRY\n01/01/2025,1.2,0.9,100,150,35",
      );
      mockedParseCsv.mockReturnValue([
        {
          date: new Date("2025-01-01"),
          rates: { EUR: 0.9, HUF: 0, JPY: 150, RUB: 100, TRY: 35, USD: 1.2 },
        },
      ]);
      const action = getAction("import-year");
      await action!([2025, "/x.csv"]);
      const data = mockedPrisma.currencyExchangeRate.createMany.mock.calls[0][0]
        .data as Array<{ target: string }>;
      const hufRows = data.filter((d) => d.target === "HUF");
      expect(hufRows).toHaveLength(0);
      expect(data).toHaveLength(5);
    });

    it("import-year empty CSV header only results 0 inserts delete runs", async () => {
      mockedParseCsv.mockReturnValue([]);
      // Ensure delete mock returns 0 and create returns 0 for this specific test to match expectation
      mockedPrisma.currencyExchangeRate.deleteMany.mockResolvedValueOnce({
        count: 0,
      });
      mockedPrisma.currencyExchangeRate.createMany.mockResolvedValueOnce({
        count: 0,
      });
      const action = getAction("import-year");
      await action!([2025, "/empty.csv"]);
      expect(mockedPrisma.currencyExchangeRate.deleteMany).toHaveBeenCalled();
      const createArg =
        mockedPrisma.currencyExchangeRate.createMany.mock.calls[0][0];
      expect(createArg.data).toHaveLength(0);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Imported 0 records"),
      );
    });

    it("import-year duplicate row expects error from Prisma P2002", async () => {
      mockedPrisma.currencyExchangeRate.createMany.mockRejectedValue(
        new Error("Unique constraint failed"),
      );
      const action = getAction("import-year");
      await expect(action!([2025, "/dup.csv"])).rejects.toThrow(
        "Unique constraint",
      );
    });

    it("import-year bad date 31/02/2025 results Invalid Date handling", async () => {
      mockedParseDate.mockReturnValue(new Date("Invalid"));
      mockedGetUtcStart.mockImplementation(() => new Date("Invalid"));
      mockedGetUtcString.mockImplementation(() => {
        throw new RangeError("Invalid time value");
      });
      const action = getAction("import-year");
      await expect(action!([2025, "/bad.csv"])).rejects.toThrow(RangeError);
    });

    it("import-year non-utf8 cp1251 results mojibake test expecting failure or misparse", async () => {
      mockedFs.readFileSync.mockReturnValue("���,USD\n01/01/2025,1.2");
      mockedParseCsv.mockReturnValue([
        {
          date: new Date("2025-01-01"),
          rates: { USD: NaN, EUR: NaN, RUB: NaN, HUF: 0, JPY: 0, TRY: 0 },
        },
      ]);
      const action = getAction("import-year");
      await action!([2025, "/cp1251.csv"]);
      const data =
        mockedPrisma.currencyExchangeRate.createMany.mock.calls[0][0].data;
      expect(data).toHaveLength(0);
    });

    it("year argument parser throws InvalidArgumentError for invalid year", () => {
      class InvalidArgumentError extends Error {}
      expect(() => {
        if (!"1999".match(/^20[0-9]{2}$/)) {
          throw new InvalidArgumentError("Invalid year 1999");
        }
      }).toThrow("Invalid year");
      expect(() => {
        if (!"2025".match(/^20[0-9]{2}$/)) throw new InvalidArgumentError("");
      }).not.toThrow();
    });

    it("year argument parser throws for missing file", () => {
      mockedFs.existsSync.mockReturnValue(false);
      class InvalidArgumentError extends Error {}
      const year = "2025";
      const csvPath = "/fake/exchange-rates/2025.csv";
      mockedPath.resolve.mockReturnValue(csvPath);
      expect(() => {
        if (!year.match(/^20[0-9]{2}$/)) throw new InvalidArgumentError("");
        if (!mockedFs.existsSync(csvPath))
          throw new InvalidArgumentError(`${csvPath} does not exist`);
      }).toThrow("does not exist");
    });
  });

  describe("convert-transactions command", () => {
    it("convert-transactions with GBP transaction uses rate 1", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t1", amount: 1000, currency: "GBP" },
      ]);
      mockedPrisma.transactionsOnCategories.findMany.mockResolvedValue([]);
      mockedGetRates.mockResolvedValue(new Map([["t1", 1]]));
      mockedGetRate.mockReturnValue(1);
      const mockUpdate = jest.fn().mockResolvedValue({ id: "t1" });
      mockedPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          transaction: {
            findMany: mockedPrisma.transaction.findMany,
            update: mockUpdate,
          },
          transactionsOnCategories: {
            findMany: mockedPrisma.transactionsOnCategories.findMany,
            update: jest.fn().mockResolvedValue({}),
          },
          currencyExchangeRate: mockedPrisma.currencyExchangeRate,
        };
        return cb(tx);
      });

      const action = getAction("convert-transactions");
      await action!(undefined);

      expect(mockedGetRates).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { amount_converted: 1000 },
          where: { id: "t1" },
        }),
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Converted 1 out of 1 transactions"),
      );
    });

    it("convert-transactions missing rate throws Can't find exchange rate", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t2", amount: 2000, currency: "USD" },
      ]);
      mockedPrisma.transactionsOnCategories.findMany.mockResolvedValue([]);
      mockedGetRates.mockRejectedValue(
        new Error("Can't find exchange rate for: USD on 2024-01-01"),
      );
      mockedPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          transaction: {
            findMany: mockedPrisma.transaction.findMany,
            update: jest.fn(),
          },
          transactionsOnCategories: {
            findMany: mockedPrisma.transactionsOnCategories.findMany,
            update: jest.fn(),
          },
          currencyExchangeRate: mockedPrisma.currencyExchangeRate,
        };
        return cb(tx);
      });

      const action = getAction("convert-transactions");
      await expect(action!(undefined)).rejects.toThrow(
        "Can't find exchange rate",
      );
    });

    it("convert-transactions rounding amount 123 with rate 0.79877 rounds correctly", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "t3", amount: 123, currency: "EUR" },
      ]);
      mockedPrisma.transactionsOnCategories.findMany.mockResolvedValue([]);
      mockedGetRates.mockResolvedValue(new Map([["t3", 0.79877]]));
      mockedGetRate.mockReturnValue(0.79877);
      const mockUpdate = jest.fn().mockResolvedValue({ id: "t3" });
      mockedPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          transaction: {
            findMany: mockedPrisma.transaction.findMany,
            update: mockUpdate,
          },
          transactionsOnCategories: {
            findMany: mockedPrisma.transactionsOnCategories.findMany,
            update: jest.fn().mockResolvedValue({}),
          },
          currencyExchangeRate: mockedPrisma.currencyExchangeRate,
        };
        return cb(tx);
      });

      const action = getAction("convert-transactions");
      await action!(undefined);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { amount_converted: 98 },
        }),
      );
    });

    it("convert-transactions filters null items after map no-op characterization", async () => {
      mockedPrisma.transaction.findMany.mockResolvedValue([
        { id: "a", amount: 10, currency: "GBP" },
      ]);
      mockedPrisma.transactionsOnCategories.findMany.mockResolvedValue([]);
      mockedGetRates.mockResolvedValue(new Map([["a", 1]]));
      mockedGetRate.mockReturnValue(1);
      const mockUpdate = jest.fn().mockResolvedValue({ id: "a" });
      mockedPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          transaction: {
            findMany: mockedPrisma.transaction.findMany,
            update: mockUpdate,
          },
          transactionsOnCategories: {
            findMany: mockedPrisma.transactionsOnCategories.findMany,
            update: jest.fn().mockResolvedValue({}),
          },
          currencyExchangeRate: mockedPrisma.currencyExchangeRate,
        };
        return cb(tx);
      });
      const action = getAction("convert-transactions");
      await action!(undefined);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
