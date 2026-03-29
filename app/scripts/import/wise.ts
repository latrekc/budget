import { Command } from "commander";
import { parse as parseDate } from "date-format-parse";
import { Currency, enumFromStringValue, Source } from "../..//lib/types";
import {
  parsePathToCsvFile,
  parseTransactionsFile,
  upsertTransactions,
} from "./utils";

export const parseWise = (program: Command) =>
  program
    .command("wise")
    .description("Import Wise transactions")
    .argument("<path>", "path to Wise export file", parsePathToCsvFile)
    .action(async (csvFilePath: string) => {
      const records = parseTransactionsFile<{
        Amount: string;
        Currency: string;
        Date: string;
        Description: string;
        "TransferWise ID": string;
      }>(csvFilePath, (record) => ({
        amount: Math.round(parseFloat(record.Amount) * 100),
        currency: enumFromStringValue(Currency, record.Currency),
        date: parseDate(record.Date, "DD-MM-YYYY"),
        description: record.Description,
        id: record["TransferWise ID"] + "-" + record.Currency,
        source: Source.Wise,
      }));

      await upsertTransactions(Source.Wise, records);
    });
