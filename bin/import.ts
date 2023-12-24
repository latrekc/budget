#!/usr/bin/env ts-node-script
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { Command, InvalidArgumentError } from "commander";
import { parse as parseDate } from "date-format-parse";
import hash from "object-hash";
import { PrismaClient } from "@prisma/client";
import { OfxParser } from "@hublaw/ofx-parser";

import { Currency, Source, Transaction } from "../src/types";

const prisma = new PrismaClient();

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

function parsePathToOFXDirectory(filepath: string): string {
  const directoryPath = path.resolve(__dirname, filepath);

  if (!fs.existsSync(directoryPath)) {
    throw new InvalidArgumentError(`Directory doesn't exist`);
  }

  if (!fs.statSync(directoryPath).isDirectory()) {
    throw new InvalidArgumentError(`Path is not a directory`);
  }

  if (
    fs.readdirSync(directoryPath).filter((value) => value.endsWith(".ofx"))
      .length === 0
  ) {
    throw new InvalidArgumentError(`Directory doesn't contain OFX files`);
  }

  return directoryPath;
}

async function upsertTransactions(type: Source, records: Transaction[]) {
  const countBefore = await prisma.transaction.count();

  const inserts = records.map((record) =>
    prisma.transaction.upsert({
      where: { id: record.id },
      update: {},
      create: { ...record },
      select: { id: true },
    }),
  );

  await prisma.$transaction(inserts);
  const countAfter = await prisma.transaction.count();

  console.log(
    `Imported ${countAfter - countBefore} out of ${
      records.length
    } ${type} transactions`,
  );
}

function parseTransactionsFile(
  csvFilePath: string,
  on_record: (record: any) => Transaction,
): Transaction[] {
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  return parse(fileContent, {
    delimiter: ",",
    columns: true,
    trim: true,
    on_record,
  });
}

program
  .command("monzo")
  .description("Import Monzo transactions")
  .argument("<path>", "path to Monzo export file", parsePathToCSVFile)
  .action(async (csvFilePath: string) => {
    const records = parseTransactionsFile(csvFilePath, (record) => ({
      id: record["Transaction ID"],
      source: Source.Monzo,
      date: parseDate(
        [record.Date, record.Time].join(" "),
        "DD/MM/YYYY HH:mm:ss",
      ),
      description: [record.name, record.Description]
        .join(" ")
        .trim()
        .replace(/\s{2,}/g, " "),
      amount: parseFloat(record.Amount),
      currency: enumFromStringValue(Currency, record.Currency),
    }));

    await upsertTransactions(Source.Monzo, records);
  });

program
  .command("revolut")
  .description("Import Revolut transactions")
  .argument("<path>", "path to Revolut export file", parsePathToCSVFile)
  .action(async (csvFilePath: string) => {
    const records = parseTransactionsFile(csvFilePath, (record) => ({
      id: hash(record),
      source: Source.Revolut,
      date: parseDate(record["Started Date"], "YYYY-MM-DD HH:mm:ss"),
      description: record.Description,
      amount: parseFloat(record.Amount),
      currency: enumFromStringValue(Currency, record.Currency),
    }));

    await upsertTransactions(Source.Revolut, records);
  });

program
  .command("hsbc")
  .description("Import HSBC transactions")
  .argument(
    "<path>",
    "path to a HSBC directory with ofx files",
    parsePathToOFXDirectory,
  )
  .action(async (directoryPath: string) => {
    const records: Transaction[] = [];
    const ofxParser = new OfxParser();

    fs.readdirSync(directoryPath)
      .filter((value) => value.endsWith(".ofx"))
      .map((filePath) => path.resolve(directoryPath, filePath))
      .forEach(async (filePath) => {
        const content = fs.readFileSync(filePath, "utf-8");
        const ofx = await ofxParser.parseStatement(content);
        const currencyMatch = content.match(/<CURDEF>([A-Z]{3})<\/CURDEF>/);
        const currency = enumFromStringValue(
          Currency,
          (currencyMatch || [])[1],
        );

        ofx.transactions?.forEach((transaction) => {
          records.push({
            id: transaction.fitId ?? "",
            source: Source.HSBC,
            date: transaction.datePosted ?? new Date(),
            description: [transaction.name, transaction.memo].join(" "),
            amount: transaction.amount ?? 0,
            currency,
          });
        });
      });

    await upsertTransactions(Source.HSBC, records);
  });

program.parse();
