import { Command } from "commander";
import { parse as parseDate } from "date-format-parse";
import hash from "object-hash";
import { Currency, enumFromStringValue, Source } from "../..//lib/types";
import {
  parsePathToCsvFile,
  parseTransactionsFile,
  upsertTransactions,
} from "./utils";

export const parseRevolut = (program: Command) =>
  program
    .command("revolut")
    .description("Import Revolut transactions")
    .argument("<path>", "path to Revolut export file", parsePathToCsvFile)
    .action(async (csvFilePath: string) => {
      const records = parseTransactionsFile<{
        Amount: string;
        Currency: string;
        Description: string;
        "Started Date": string;
      }>(csvFilePath, (record) => ({
        amount: Math.round(parseFloat(record.Amount) * 100),
        currency: enumFromStringValue(Currency, record.Currency),
        date: parseDate(record["Started Date"], "YYYY-MM-DD HH:mm:ss"),
        description: record.Description,
        id: hash(record),
        source: Source.Revolut,
      }));

      await upsertTransactions(Source.Revolut, records);
    });
