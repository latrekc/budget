import {
  getTransactionCurrencyRate,
  getTransactionsCurrencyRates,
} from "@/lib/currency_rates";
import prisma from "@/lib/prisma";
import { Currency } from "@/lib/types";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    currencyExchangeRate: {
      findMany: jest.fn(),
    },
  },
}));

describe("currency_rates", () => {
  const mockedPrisma = prisma as unknown as {
    currencyExchangeRate: { findMany: jest.Mock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTransactionCurrencyRate", () => {
    it("throws on missing returns on present returns 0 correctly", () => {
      const map = new Map<number | string, number>([
        ["a", 1.23],
        ["b", 0],
      ]);
      expect(getTransactionCurrencyRate(map, "a")).toBe(1.23);
      expect(getTransactionCurrencyRate(map, "b")).toBe(0);
      expect(() => getTransactionCurrencyRate(map, "c")).toThrow(
        "Unknown rate of c",
      );
    });

    it("string id vs number id distinct map keys", () => {
      const map = new Map<number | string, number>([
        [1, 1.1],
        ["1", 2.2],
      ]);
      expect(getTransactionCurrencyRate(map, 1)).toBe(1.1);
      expect(getTransactionCurrencyRate(map, "1")).toBe(2.2);
    });
  });

  describe("getTransactionsCurrencyRates", () => {
    it("GBP-only transactions return Map of 1s without DB hit mocked prisma returns empty array", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([]);
      const txs = [
        { id: "1", currency: Currency.GBP, date: new Date("2024-01-01") },
        { id: "2", currency: Currency.GBP, date: new Date("2024-01-02") },
      ] as never;
      const result = await getTransactionsCurrencyRates(txs);
      expect(result.get("1")).toBe(1);
      expect(result.get("2")).toBe(1);
      expect(mockedPrisma.currencyExchangeRate.findMany).toHaveBeenCalled();
      const whereArg =
        mockedPrisma.currencyExchangeRate.findMany.mock.calls[0][0].where;
      expect(whereArg.base).toBe("GBP");
      expect(whereArg.date.in).toHaveLength(2);
    });

    it("EUR transaction 2024-01-15 returns mocked rate 1.17", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        {
          date: new Date("2024-01-15T00:00:00.000Z"),
          rate: 1.17,
          target: "EUR",
        },
      ]);
      const txs = [
        { id: "e1", currency: Currency.EUR, date: new Date("2024-01-15") },
      ] as never;
      const result = await getTransactionsCurrencyRates(txs);
      expect(result.get("e1")).toBe(1.17);
    });

    it("Two transactions same missing currency-date throw once with sorted unique list", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([]);
      const txs = [
        { id: "m1", currency: Currency.USD, date: new Date("2024-02-01") },
        { id: "m2", currency: Currency.USD, date: new Date("2024-02-01") },
        { id: "m3", currency: Currency.EUR, date: new Date("2024-01-01") },
      ] as never;
      await expect(getTransactionsCurrencyRates(txs)).rejects.toThrow(
        "Can't find exchange rate for: EUR on 2024-01-01\nUSD on 2024-02-01",
      );
    });

    it("Empty input returns empty Map", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([]);
      const result = await getTransactionsCurrencyRates([]);
      expect(result.size).toBe(0);
      expect(mockedPrisma.currencyExchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ date: { in: [] } }),
        }),
      );
    });

    it("Invalid Date input throws RangeError", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([]);
      const txs = [
        { id: "bad", currency: Currency.USD, date: new Date("invalid") },
      ] as never;
      await expect(getTransactionsCurrencyRates(txs)).rejects.toThrow(
        RangeError,
      );
    });

    it("Timezone new Date 2024 0 1 23 0 documents local-to-UTC shift", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        { date: new Date(Date.UTC(2024, 0, 1)), rate: 1.5, target: "USD" },
      ]);
      // new Date(2024,0,1,23,0) is local time Jan 1 23:00, getUTCStartOfDate uses local parts => UTC midnight Jan1, so key matches.
      const localLate = new Date(2024, 0, 1, 23, 0);
      const txs = [
        { id: "tz", currency: Currency.USD, date: localLate },
      ] as never;
      const result = await getTransactionsCurrencyRates(txs);
      expect(result.get("tz")).toBe(1.5);
      const calledIn =
        mockedPrisma.currencyExchangeRate.findMany.mock.calls[0][0].where.date
          .in[0];
      // calledIn should be Date object representing UTC start based on local parts
      expect(calledIn.getUTCHours()).toBe(0);
    });

    it("Duplicate transaction ids last wins", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        { date: new Date("2024-03-01T00:00:00.000Z"), rate: 2, target: "USD" },
      ]);
      const txs = [
        { id: "dup", currency: Currency.USD, date: new Date("2024-03-01") },
        { id: "dup", currency: Currency.GBP, date: new Date("2024-03-02") },
      ] as never;
      const result = await getTransactionsCurrencyRates(txs);
      // last wins => GBP => 1
      expect(result.get("dup")).toBe(1);
      expect(result.size).toBe(1);
    });

    it("String id vs number id distinct", async () => {
      mockedPrisma.currencyExchangeRate.findMany.mockResolvedValue([
        {
          date: new Date("2024-04-01T00:00:00.000Z"),
          rate: 1.3,
          target: "EUR",
        },
      ]);
      const txs = [
        { id: 1, currency: Currency.EUR, date: new Date("2024-04-01") },
        { id: "1", currency: Currency.EUR, date: new Date("2024-04-01") },
      ] as never;
      const result = await getTransactionsCurrencyRates(txs);
      expect(result.get(1)).toBe(1.3);
      expect(result.get("1")).toBe(1.3);
      expect(result.size).toBe(2);
    });
  });
});
