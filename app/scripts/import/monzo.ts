import { Command } from "commander";
import { parse as parseDate } from "date-format-parse";
import { Currency, enumFromStringValue, Source } from "../..//lib/types";
import {
  parsePathToCsvFile,
  parseTransactionsFile,
  upsertTransactions,
} from "./utils";

export const parseMonzo = (program: Command) =>
  program
    .command("monzo")
    .description("Import Monzo transactions")
    .argument("<path>", "path to Monzo export file", parsePathToCsvFile)
    .action(async (csvFilePath: string) => {
      const records = parseTransactionsFile<{
        Amount: string;
        Currency: string;
        Date: string;
        Description: string;
        Name?: string;
        Time: string;
        "Transaction ID": string;
      }>(csvFilePath, (record) => ({
        amount: Math.round(parseFloat(record.Amount) * 100),
        currency: enumFromStringValue(Currency, record.Currency),
        date: parseDate(
          [record.Date, record.Time].join(" "),
          "DD/MM/YYYY HH:mm:ss",
        ),
        description: [record.Name, record.Description]
          .join(" ")
          .trim()
          .replace(/\s{2,}/g, " "),
        id: record["Transaction ID"],
        source: Source.Monzo,
      }));

      await upsertTransactions(Source.Monzo, records);
    });
