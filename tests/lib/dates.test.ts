import {
  getUTCStartOfDate,
  getUTCStartOfDateString,
  monthNames,
} from "@/lib/dates";

describe("dates", () => {
  describe("monthNames", () => {
    it("has size 12 with correct English names", () => {
      expect(monthNames.size).toBe(12);
      expect(monthNames.get(1)).toBe("January");
      expect(monthNames.get(2)).toBe("February");
      expect(monthNames.get(3)).toBe("March");
      expect(monthNames.get(4)).toBe("April");
      expect(monthNames.get(5)).toBe("May");
      expect(monthNames.get(6)).toBe("June");
      expect(monthNames.get(7)).toBe("July");
      expect(monthNames.get(8)).toBe("August");
      expect(monthNames.get(9)).toBe("September");
      expect(monthNames.get(10)).toBe("October");
      expect(monthNames.get(11)).toBe("November");
      expect(monthNames.get(12)).toBe("December");
    });

    it("returns undefined for out of range 0 and 13", () => {
      expect(monthNames.get(0)).toBeUndefined();
      expect(monthNames.get(13)).toBeUndefined();
    });

    it("returns undefined for string key", () => {
      expect(monthNames.get("1" as unknown as number)).toBeUndefined();
    });
  });

  describe("getUTCStartOfDate", () => {
    it("returns UTC midnight based on local date parts for 2024-06-10 15:30", () => {
      const input = new Date(2024, 5, 10, 15, 30);
      const result = getUTCStartOfDate(input);
      expect(result.toISOString()).toMatch(/T00:00:00\.000Z$/);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(5);
      expect(result.getUTCDate()).toBe(10);
    });

    it("handles leap year Feb 29 2024", () => {
      const input = new Date(2024, 1, 29, 12, 0);
      const result = getUTCStartOfDate(input);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(29);
    });

    it("handles Feb 29 2023 normalizing to Mar 1 documenting behavior", () => {
      const input = new Date(2023, 1, 29);
      const result = getUTCStartOfDate(input);
      // JS Date normalizes invalid Feb 29 to Mar 1
      expect(result.getUTCMonth()).toBe(2);
      expect(result.getUTCDate()).toBe(1);
    });

    it("handles year boundary Dec 31", () => {
      const input = new Date(2024, 11, 31, 23, 59);
      const result = getUTCStartOfDate(input);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(11);
      expect(result.getUTCDate()).toBe(31);
    });

    it("handles year boundary Jan 1", () => {
      const input = new Date(2025, 0, 1, 0, 1);
      const result = getUTCStartOfDate(input);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(0);
      expect(result.getUTCDate()).toBe(1);
    });

    it("throws RangeError for Invalid Date via toISOString indirect usage in getUTCStartOfDateString", () => {
      const invalid = new Date("invalid");
      expect(() => getUTCStartOfDate(invalid).toISOString()).toThrow(
        RangeError,
      );
    });

    it("throws TypeError for null undefined string number input", () => {
      expect(() => getUTCStartOfDate(null as unknown as Date)).toThrow(
        TypeError,
      );
      expect(() => getUTCStartOfDate(undefined as unknown as Date)).toThrow(
        TypeError,
      );
      expect(() => getUTCStartOfDate("2024-01-01" as unknown as Date)).toThrow(
        TypeError,
      );
      expect(() => getUTCStartOfDate(123 as unknown as Date)).toThrow(
        TypeError,
      );
    });
  });

  describe("getUTCStartOfDateString", () => {
    it("returns YYYY-MM-DD pattern", () => {
      const result = getUTCStartOfDateString(new Date(2024, 5, 10, 15, 30));
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe("2024-06-10");
    });

    it("throws RangeError for Invalid Date", () => {
      expect(() => getUTCStartOfDateString(new Date("invalid"))).toThrow(
        RangeError,
      );
    });

    it("handles leap year", () => {
      const result = getUTCStartOfDateString(new Date(2024, 1, 29));
      expect(result).toBe("2024-02-29");
    });
  });
});
