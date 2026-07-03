import {
  AmountRelation,
  Currency,
  DEFAULT_CURRENCY,
  enumFromStringValue,
  PubSubChannels,
  SortBy,
  Source,
} from "@/lib/types";

describe("types", () => {
  describe("enumFromStringValue", () => {
    it("returns Source.Barclays for Barclays", () => {
      expect(enumFromStringValue(Source, "Barclays")).toBe(Source.Barclays);
    });

    it("returns Currency.EUR for EUR", () => {
      expect(enumFromStringValue(Currency, "EUR")).toBe(Currency.EUR);
    });

    it("returns AmountRelation EQUAL GREATER LESS", () => {
      expect(enumFromStringValue(AmountRelation, "EQUAL")).toBe(
        AmountRelation.EQUAL,
      );
      expect(enumFromStringValue(AmountRelation, "GREATER")).toBe(
        AmountRelation.GREATER,
      );
      expect(enumFromStringValue(AmountRelation, "LESS")).toBe(
        AmountRelation.LESS,
      );
    });

    it("returns PubSubChannels values", () => {
      expect(enumFromStringValue(PubSubChannels, "Categories")).toBe(
        PubSubChannels.Categories,
      );
      expect(enumFromStringValue(PubSubChannels, "CurrencyExchangeRates")).toBe(
        PubSubChannels.CurrencyExchangeRates,
      );
      expect(enumFromStringValue(PubSubChannels, "Transactions")).toBe(
        PubSubChannels.Transactions,
      );
    });

    it("returns SortBy values", () => {
      expect(enumFromStringValue(SortBy, "Amount")).toBe(SortBy.Amount);
      expect(enumFromStringValue(SortBy, "Date")).toBe(SortBy.Date);
    });

    it("throws for lowercase barclays case-sensitive", () => {
      expect(() => enumFromStringValue(Source, "barclays")).toThrow(
        "Undefined value barclays",
      );
    });

    it("throws for empty string", () => {
      expect(() => enumFromStringValue(Source, "")).toThrow("Undefined value");
    });

    it("throws for space string", () => {
      expect(() => enumFromStringValue(Source, " ")).toThrow("Undefined value");
    });

    it("throws for UNKNOWN", () => {
      expect(() => enumFromStringValue(Currency, "UNKNOWN")).toThrow(
        "Undefined value UNKNOWN",
      );
    });

    it("throws for null undefined via cast", () => {
      expect(() =>
        enumFromStringValue(Source, null as unknown as string),
      ).toThrow();
      expect(() =>
        enumFromStringValue(Source, undefined as unknown as string),
      ).toThrow();
    });

    it("error message contains value string", () => {
      try {
        enumFromStringValue(Source, "Foo");
      } catch (e) {
        expect((e as Error).message).toContain("Foo");
      }
    });
  });

  describe("DEFAULT_CURRENCY", () => {
    it("equals GBP", () => {
      expect(DEFAULT_CURRENCY).toBe("GBP");
      expect(DEFAULT_CURRENCY).toBe(Currency.GBP);
    });
  });

  describe("PubSubChannels", () => {
    it("has 3 values", () => {
      expect(Object.values(PubSubChannels)).toHaveLength(3);
      expect(Object.values(PubSubChannels)).toEqual(
        expect.arrayContaining([
          "Categories",
          "CurrencyExchangeRates",
          "Transactions",
        ]),
      );
    });
  });

  describe("SortBy", () => {
    it("has 2 values", () => {
      expect(Object.values(SortBy)).toHaveLength(2);
      expect(Object.values(SortBy)).toEqual(
        expect.arrayContaining(["Amount", "Date"]),
      );
    });
  });

  describe("Source enum", () => {
    it("contains all 8 expected sources", () => {
      expect(Object.values(Source)).toHaveLength(8);
      expect(Object.values(Source)).toEqual(
        expect.arrayContaining([
          "Barclays",
          "HSBC",
          "Monzo",
          "Raiffeisen",
          "Revolut",
          "Sberbank",
          "Tinkoff",
          "Wise",
        ]),
      );
    });
  });

  describe("Currency enum", () => {
    it("contains 7 currencies", () => {
      expect(Object.values(Currency)).toHaveLength(7);
      expect(Object.values(Currency)).toEqual(
        expect.arrayContaining([
          "EUR",
          "GBP",
          "HUF",
          "JPY",
          "RUB",
          "TRY",
          "USD",
        ]),
      );
    });
  });
});
