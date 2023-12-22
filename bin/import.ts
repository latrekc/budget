#!/usr/bin/env ts-node-script
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { Command, InvalidArgumentError } from "commander";
import { parse as parseDate } from "date-format-parse";
import hash from "object-hash";

enum Source {
  Monzo = "Monzo",
  Revolut = "Revolut",
  HSBC = "HSBC",
  Sberbank = "Sberbank",
  Raiffeisen = "Raiffeisen",
  Tinkoff = "Tinkoff",
}

enum Currency {
  GBP = "GBP",
  EUR = "EUR",
  USD = "USD",
  RUB = "RUB",
}

type Transaction = {
  id: string;
  source: Source;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
};

function enumFromStringValue<T>(enm: { [s: string]: T }, value: string): T {
  if ((Object.values(enm) as unknown as string[]).includes(value)) {
    return value as unknown as T;
  }

  throw new Error(`Undefined value ${value} of ${enm}`);
}

const program = new Command();

program
  .description("CLI to import bank transactions into a database")
  .version("0.8.0");

function parsePathToCSVFile(filepath: string): string {
  if (!filepath.endsWith(".csv")) {
    throw new InvalidArgumentError("Not a CSV file.");
  }
  const csvFilePath = path.resolve(__dirname, filepath);

  if (!fs.existsSync(csvFilePath)) {
    throw new InvalidArgumentError(`File doesn't exist`);
  }

  return csvFilePath;
}

program
  .command("monzo")
  .description("Import Monzo transactions")
  .argument("<path>", "path to Monzo export file", parsePathToCSVFile)
  .action((filepath: string) => {
    console.log(filepath);
  });

program
  .command("revolut")
  .description("Import Revolut transactions")
  .argument("<path>", "path to Revolut export file", parsePathToCSVFile)
  .action((csvFilePath: string) => {
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const records: Transaction[] = parse(fileContent, {
      delimiter: ",",
      columns: true,
      trim: true,
      on_record: (record) => ({
        id: hash([(record["Started Date"], record.Description, record.Amount)]),
        source: Source.Revolut,
        date: parseDate(record["Started Date"], "YYYY-MM-DD HH:mm:ss"),
        description: record.Description,
        amount: parseFloat(record.Amount),
        currency: enumFromStringValue(Currency, record.Currency),
      }),
    });

    console.log(records);
  });

program.parse();
