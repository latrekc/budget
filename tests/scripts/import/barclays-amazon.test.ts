import * as fs from "fs";

import { Currency, Source } from "@/lib/types";
import { parseBarclaysAmazon } from "@/scripts/import/barclays-amazon";
import { upsertTransactions } from "@/scripts/import/utils";

jest.mock("fs");
jest.mock("@/scripts/import/utils", () => ({
  parsePathToJSONFile: jest.fn((p) => p),
  upsertTransactions: jest.fn(async () => {}),
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedUpsert = upsertTransactions as jest.Mock;

describe("barclays-amazon import", () => {
  let actionHandler: (path: string) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockProgram: Record<string, jest.Mock> = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      argument: jest.fn().mockReturnThis(),
      action: jest.fn(),
    };
    mockProgram.action.mockImplementation(
      (fn: (path: string) => Promise<void>) => {
        actionHandler = fn;
        return mockProgram;
      },
    );
    parseBarclaysAmazon(
      mockProgram as unknown as Parameters<typeof parseBarclaysAmazon>[0],
    );
  });

  function mockJson(obj: unknown) {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(obj) as never);
  }

  const baseResponse = (groups: unknown[]) => ({
    error: false,
    httpStatus: 200,
    responseBody: {
      data: {
        attributes: {
          declinedBanner: false,
          moreTxnsInTheLastGroup: false,
          pagination: { next: null },
          transactionGroups: groups,
        },
        id: "x",
        type: "y",
      },
    },
  });

  it("valid JSON 2 groups inserts 2 records", async () => {
    mockJson(
      baseResponse([
        {
          labelShort: "g1",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "GBP", value: "12.345" },
              category: null,
              dateTime: "2024-01-01T10:00:00Z",
              heading: "Amazon",
              id: "a1",
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
        {
          labelShort: "g2",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "USD", value: "5.00" },
              category: null,
              dateTime: "2024-01-02T10:00:00Z",
              heading: "Test",
              id: "a2",
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
      ]),
    );
    await actionHandler("file.json");
    expect(mockedUpsert).toHaveBeenCalledTimes(1);
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual(
      expect.objectContaining({
        amount: -1235,
        currency: Currency.GBP,
        id: "a1",
        source: Source.Barclays,
      }),
    );
    expect(records[1].currency).toBe(Currency.USD);
    expect(records[1].amount).toBe(-500);
  });

  it("status PENDING included due to typo bug, PERNDING excluded", async () => {
    mockJson(
      baseResponse([
        {
          labelShort: "g",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "GBP", value: "1" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "P1",
              id: "p1",
              logo: null,
              status: "PENDING",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
            {
              amount: { currency: "GBP", value: "2" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "P2",
              id: "p2",
              logo: null,
              status: "PERNDING",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
      ]),
    );
    await actionHandler("f.json");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("p1");
  });

  it("missing id filtered out", async () => {
    mockJson(
      baseResponse([
        {
          labelShort: "g",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "GBP", value: "1" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "H",
              id: null,
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
            {
              amount: { currency: "GBP", value: "2" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "H2",
              id: "ok",
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
      ]),
    );
    await actionHandler("f.json");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe("ok");
  });

  it("malformed JSON throws SyntaxError", async () => {
    mockedFs.readFileSync.mockReturnValue("{ bad json" as never);
    await expect(actionHandler("f.json")).rejects.toThrow(SyntaxError);
  });

  it("unknown currency XYZ throws", async () => {
    mockJson(
      baseResponse([
        {
          labelShort: "g",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "XYZ", value: "1" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "H",
              id: "x",
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
      ]),
    );
    await expect(actionHandler("f.json")).rejects.toThrow(
      "Undefined value XYZ",
    );
  });

  it("amount 12.345 rounds to -1235", async () => {
    mockJson(
      baseResponse([
        {
          labelShort: "g",
          totalAmount: { currency: "GBP", value: "0" },
          transactions: [
            {
              amount: { currency: "GBP", value: "12.345" },
              category: null,
              dateTime: "2024-01-01T00:00:00Z",
              heading: "H",
              id: "r",
              logo: null,
              status: "POSTED",
              subheading: "",
              supplementaryInfo: null,
              transactionDate: null,
            },
          ],
        },
      ]),
    );
    await actionHandler("f.json");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records[0].amount).toBe(-1235);
  });

  it("empty transactionGroups results in 0 records", async () => {
    mockJson(baseResponse([]));
    await actionHandler("f.json");
    const records = mockedUpsert.mock.calls[0][1];
    expect(records).toHaveLength(0);
  });
});
