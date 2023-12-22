#!/usr/bin/env ts-node-script
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { Command, InvalidArgumentError } from "commander";
import { parse as parseDate } from "date-format-parse";
import hash from "object-hash";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function upsertTransactions(records: Transaction[]): Promise<number> {
  const countBefore = await prisma.transaction.count();

  const inserts = records.map((record) =>
    prisma.transaction.upsert({
      where: { id: record.id },
      update: {},
      create: { ...record },
      select: { id: true },
    })
  );

  await prisma.$transaction(inserts);
  const countAfter = await prisma.transaction.count();

  return countAfter - countBefore;
}

function parseTransactionsFile(
  csvFilePath: string,
  {
    columns = true,
    trim = true,
    on_record,
  }: {
    columns?: boolean;
    trim?: boolean;
    on_record: (record: any) => Transaction;
  }
): Transaction[] {
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  return parse(fileContent, {
    delimiter: ",",
    columns,
    trim,
    on_record,
  });
}

async function parseAndImportTransactions(
  type: Source,
  csvFilePath: string,
  opts: {
    columns?: boolean;
    trim?: boolean;
    on_record: (record: any) => Transaction;
  }
) {
  const records = parseTransactionsFile(csvFilePath, opts);
  const imported = await upsertTransactions(records);
  console.log(
    `Imported ${imported} out of ${records.length} ${type} transactions`
  );
}

program
  .command("monzo")
  .description("Import Monzo transactions")
  .argument("<path>", "path to Monzo export file", parsePathToCSVFile)
  .action(async (csvFilePath: string) => {
    await parseAndImportTransactions(Source.Monzo, csvFilePath, {
      on_record: (record) => ({
        id: record["Transaction ID"],
        source: Source.Monzo,
        date: parseDate(
          [record.Date, record.Time].join(" "),
          "DD/MM/YYYY HH:mm:ss"
        ),
        description: [record.name, record.Description]
          .join(" ")
          .trim()
          .replace(/\s{2,}/g, " "),
        amount: parseFloat(record.Amount),
        currency: enumFromStringValue(Currency, record.Currency),
      }),
    });
  });

program
  .command("revolut")
  .description("Import Revolut transactions")
  .argument("<path>", "path to Revolut export file", parsePathToCSVFile)
  .action(async (csvFilePath: string) => {
    await parseAndImportTransactions(Source.Revolut, csvFilePath, {
      on_record: (record) => ({
        id: hash(record),
        source: Source.Revolut,
        date: parseDate(record["Started Date"], "YYYY-MM-DD HH:mm:ss"),
        description: record.Description,
        amount: parseFloat(record.Amount),
        currency: enumFromStringValue(Currency, record.Currency),
      }),
    });
  });

program
  .command("hsbc")
  .description("Import HSBC transactions")
  .argument("<path>", "path to HSBC export file", parsePathToCSVFile)
  .action(async (csvFilePath: string) => {
    await parseAndImportTransactions(Source.HSBC, csvFilePath, {
      columns: false,
      trim: false,
      on_record: (record) => ({
        id: hash(record),
        source: Source.HSBC,
        date: parseDate(record[0], "DD/MM/YYYY"),
        description: record[1],
        amount: parseFloat(record[2]),
        currency: Currency.GBP,
      }),
    });
  });

program.parse();
