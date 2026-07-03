import { InvalidArgumentError } from "commander";
import * as fs from "fs";
import * as iconv from "iconv-lite";
import * as path from "path";

import { getTransactionsCurrencyRates } from "@/lib/currency_rates";
import prisma from "@/lib/prisma";
import { Source } from "@/lib/types";
import {
  parsePathToCSVDirectory,
  parsePathToCsvFile,
  parsePathToJSONFile,
  parsePathToOFXDirectory,
  parsePathToOfxFile,
  parseTransactionsFile,
  upsertTransactions,
} from "@/scripts/import/utils";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    transaction: {
      count: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(async (ops: Array<Promise<unknown>>) =>
      Promise.all(ops),
    ),
  },
}));

jest.mock("@/lib/currency_rates", () => ({
  getTransactionsCurrencyRates: jest.fn(),
}));

const mockedPrisma = prisma as unknown as {
  transaction: { count: jest.Mock; upsert: jest.Mock };
  $transaction: jest.Mock;
};
const mockedGetRates = getTransactionsCurrencyRates as jest.Mock;

describe("import utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("parsePathToCsvFile", () => {
    it("throws InvalidArgumentError for missing file", () => {
      expect(() => parsePathToCsvFile("nonexistent.csv")).toThrow(
        InvalidArgumentError,
      );
      expect(() => parsePathToCsvFile("nonexistent.csv")).toThrow(
        "File doesn't exist",
      );
    });

    it("throws InvalidArgumentError for uppercase extension", () => {
      // __dirname resolves to app/scripts/import, so relative path will be resolved there; we test extension check before fs check by using uppercase
      expect(() => parsePathToCsvFile("test.CSV")).toThrow(
        InvalidArgumentError,
      );
      expect(() => parsePathToCsvFile("test.CSV")).toThrow("Not a CSV file");
    });

    it("returns resolved path for existing csv file using fixture", () => {
      // create fixture if needed in test setup? we assume exists, test will create file dynamically
      const tmpDir = path.resolve(__dirname, "../../fixtures/import");
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, "tmp_test.csv"), "a,b\n1,2");
      const relative = path.relative(
        path.resolve(__dirname, "../../../app/scripts/import"),
        path.join(tmpDir, "tmp_test.csv"),
      );
      const result = parsePathToCsvFile(relative);
      expect(result.endsWith("tmp_test.csv")).toBe(true);
      fs.unlinkSync(path.join(tmpDir, "tmp_test.csv"));
    });
  });

  describe("parsePathToOfxFile", () => {
    it("throws for missing ofx", () => {
      expect(() => parsePathToOfxFile("missing.ofx")).toThrow(
        InvalidArgumentError,
      );
    });
    it("throws for wrong extension uppercase", () => {
      expect(() => parsePathToOfxFile("file.OFX")).toThrow("Not a OFX file");
    });
  });

  describe("parsePathToJSONFile", () => {
    it("throws for missing json", () => {
      expect(() => parsePathToJSONFile("missing.json")).toThrow(
        InvalidArgumentError,
      );
    });
  });

  describe("parsePathToCSVDirectory", () => {
    it("throws InvalidArgumentError for empty directory", () => {
      const tmpEmpty = path.resolve(
        __dirname,
        "../../fixtures/import/empty_dir_test",
      );
      fs.mkdirSync(tmpEmpty, { recursive: true });
      // ensure empty
      fs.readdirSync(tmpEmpty).forEach((f) =>
        fs.unlinkSync(path.join(tmpEmpty, f)),
      );
      const relative = path.relative(
        path.resolve(__dirname, "../../../app/scripts/import"),
        tmpEmpty,
      );
      expect(() => parsePathToCSVDirectory(relative)).toThrow(
        InvalidArgumentError,
      );
      expect(() => parsePathToCSVDirectory(relative)).toThrow(
        "Directory doesn't contain CSV files",
      );
      fs.rmdirSync(tmpEmpty);
    });

    it("throws for non-existent directory", () => {
      expect(() => parsePathToCSVDirectory("no_such_dir_xyz")).toThrow(
        "Directory doesn't exist",
      );
    });

    it("throws for path not directory", () => {
      const tmpFile = path.resolve(
        __dirname,
        "../../fixtures/import/not_a_dir.txt",
      );
      fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
      fs.writeFileSync(tmpFile, "x");
      const relative = path.relative(
        path.resolve(__dirname, "../../../app/scripts/import"),
        tmpFile,
      );
      expect(() => parsePathToCSVDirectory(relative)).toThrow(
        "Path is not a directory",
      );
      fs.unlinkSync(tmpFile);
    });
  });

  describe("parsePathToOFXDirectory", () => {
    it("validates ofx directory similarly", () => {
      const tmpEmpty = path.resolve(
        __dirname,
        "../../fixtures/import/empty_ofx_dir",
      );
      fs.mkdirSync(tmpEmpty, { recursive: true });
      const relative = path.relative(
        path.resolve(__dirname, "../../../app/scripts/import"),
        tmpEmpty,
      );
      expect(() => parsePathToOFXDirectory(relative)).toThrow(
        "Directory doesn't contain OFX files",
      );
      fs.rmdirSync(tmpEmpty);
    });
  });

  describe("parseTransactionsFile", () => {
    const fixturesDir = path.resolve(__dirname, "../../fixtures/import");
    beforeAll(() => {
      fs.mkdirSync(fixturesDir, { recursive: true });
    });

    it("returns empty array for empty file with header only", () => {
      const file = path.join(fixturesDir, "empty.csv");
      fs.writeFileSync(file, "Amount,Currency\n");
      const result = parseTransactionsFile(file, (r) => r as never);
      expect(result).toHaveLength(0);
    });

    it("handles BOM header mismatch", () => {
      const file = path.join(fixturesDir, "bom.csv");
      // BOM + header Date,Amount ; csv-parse trims BOM, so Date field is correctly parsed
      fs.writeFileSync(file, "\uFEFFDate,Amount\n2024-01-01,10");
      const result = parseTransactionsFile<{ Date: string; Amount: string }>(
        file,
        (record) => {
          return {
            id: "1",
            amount: Number(record.Amount),
            currency: "GBP",
            date: new Date(record.Date),
            description: "",
            source: "Barclays",
          } as never;
        },
      );
      // csv-parse strips BOM, Date is defined
      expect(result[0]).toEqual(expect.objectContaining({ amount: 10 }));
    });

    it("decodes cp1251 correctly for Cyrillic", () => {
      const file = path.join(fixturesDir, "cp1251.csv");
      const cyrillic = "Описание,Сумма\nТест,123";
      // Actually write cp1251 encoded file using iconv-lite
      fs.writeFileSync(file, iconv.encode(cyrillic, "cp1251"));
      const result = parseTransactionsFile<{ Описание: string; Сумма: string }>(
        file,
        (r) =>
          ({
            id: r.Описание,
            amount: Number(r.Сумма),
            currency: "GBP",
            date: new Date(),
            description: r.Описание,
            source: "Barclays",
          }) as never,
        { customEncoding: "cp1251" },
      );
      expect(result).toHaveLength(1);
      expect(
        (result[0] as unknown as { description: string }).description,
      ).toBe("Тест");
      expect(result[0].amount).toBe(123);
    });

    it("trims content and parses delimiter", () => {
      const file = path.join(fixturesDir, "trim.csv");
      fs.writeFileSync(file, "  a , b \n 1 , 2 \n");
      const result = parseTransactionsFile<{ a: string; b: string }>(
        file,
        (r) =>
          ({
            id: r.a,
            amount: Number(r.b),
            currency: "GBP",
            date: new Date(),
            description: "",
            source: "Barclays",
          }) as never,
      );
      expect(result[0].id).toBe("1");
      expect(result[0].amount).toBe(2);
    });
  });

  describe("upsertTransactions", () => {
    it("inserts records and logs count difference", async () => {
      mockedPrisma.transaction.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(8);
      mockedPrisma.transaction.upsert.mockResolvedValue({ id: "x" });
      mockedGetRates.mockResolvedValue(
        new Map([
          ["1", 1],
          ["2", 1.2],
          ["3", 0.8],
        ]),
      );
      const records = [
        {
          id: "1",
          amount: 100,
          currency: "GBP",
          date: new Date(),
          description: "a",
          source: Source.Barclays,
        },
        {
          id: "2",
          amount: 200,
          currency: "USD",
          date: new Date(),
          description: "b",
          source: Source.Barclays,
        },
        {
          id: "3",
          amount: 300,
          currency: "EUR",
          date: new Date(),
          description: "c",
          source: Source.Barclays,
        },
      ] as never;
      await upsertTransactions(Source.Barclays, records);
      expect(mockedPrisma.transaction.count).toHaveBeenCalledTimes(2);
      expect(mockedGetRates).toHaveBeenCalledWith(records);
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Imported 3 out of 3 Barclays transactions"),
      );
    });

    it("duplicate second run results in inserted 0", async () => {
      mockedPrisma.transaction.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10);
      mockedPrisma.transaction.upsert.mockResolvedValue({ id: "dup" });
      mockedGetRates.mockResolvedValue(new Map([["dup", 1]]));
      const records = [
        {
          id: "dup",
          amount: 100,
          currency: "GBP",
          date: new Date(),
          description: "d",
          source: Source.Monzo,
        },
      ] as never;
      await upsertTransactions(Source.Monzo, records);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Imported 0 out of 1 Monzo transactions"),
      );
    });

    it("throws when missing exchange rate", async () => {
      mockedPrisma.transaction.count.mockResolvedValue(0);
      mockedGetRates.mockRejectedValue(
        new Error("Can't find exchange rate for: USD on 2024-01-01"),
      );
      const records = [
        {
          id: "m",
          amount: 100,
          currency: "USD",
          date: new Date("2024-01-01"),
          description: "x",
          source: Source.HSBC,
        },
      ] as never;
      await expect(upsertTransactions(Source.HSBC, records)).rejects.toThrow(
        "Can't find exchange rate",
      );
    });

    it("amount rounding edge .5 rounds correctly", async () => {
      mockedPrisma.transaction.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1);
      mockedPrisma.transaction.upsert.mockImplementation(
        async (args: { create: { amount_converted: number } }) => {
          // capture amount_converted
          expect(args.create.amount_converted).toBeDefined();
          return { id: "r" };
        },
      );
      mockedGetRates.mockResolvedValue(new Map([["r1", 1.5]])); // 1 *1.5=1.5 round =>2 ; amount is in cents already, then * rate then round.
      const records = [
        {
          id: "r1",
          amount: 1,
          currency: "USD",
          date: new Date(),
          description: "round",
          source: Source.Wise,
        },
      ] as never;
      await upsertTransactions(Source.Wise, records);
      const upsertCall = mockedPrisma.transaction.upsert.mock.calls[0][0];
      expect(upsertCall.create.amount_converted).toBe(2); // 1*1.5=1.5 round 2
    });
  });
});
