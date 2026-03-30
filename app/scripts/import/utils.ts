import { Source, TransactionWithoutAmountConverted } from "../../lib/types";

import { InvalidArgumentError } from "commander";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

import { getTransactionsCurrencyRates } from "../../lib/currency_rates";
import prisma from "../../lib/prisma";

import { decode } from "iconv-lite";

export function parsePathToCsvFile(filepath: string): string {
  if (!filepath.endsWith(".csv")) {
    throw new InvalidArgumentError("Not a CSV file.");
  }
  const csvFilePath = path.resolve(__dirname, filepath);

  if (!fs.existsSync(csvFilePath)) {
    throw new InvalidArgumentError(`File doesn't exist`);
  }

  return csvFilePath;
}

export function parsePathToOfxFile(filepath: string): string {
  if (!filepath.endsWith(".ofx")) {
    throw new InvalidArgumentError("Not an OFX file.");
  }
  const ofxFilePath = path.resolve(__dirname, filepath);

  if (!fs.existsSync(ofxFilePath)) {
    throw new InvalidArgumentError(`File doesn't exist`);
  }

  return ofxFilePath;
}

export function parsePathToJSONFile(filepath: string): string {
  if (!filepath.endsWith(".json")) {
    throw new InvalidArgumentError("Not a JSON file.");
  }
  const jsonFilePath = path.resolve(__dirname, filepath);

  if (!fs.existsSync(jsonFilePath)) {
    throw new InvalidArgumentError(`File doesn't exist`);
  }

  return jsonFilePath;
}

export function parsePathToOFXDirectory(filepath: string): string {
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

export async function upsertTransactions(
  type: Source,
  records: TransactionWithoutAmountConverted[],
) {
  const countBefore = await prisma.transaction.count();
  const currencyRates = await getTransactionsCurrencyRates(records);

  const inserts = records.map((record) =>
    prisma.transaction.upsert({
      create: {
        ...record,
        amount_converted: Math.round(
          record.amount * currencyRates.get(record.id)!,
        ),
      },
      select: { id: true },
      update: {},
      where: { id: record.id },
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

export function parseTransactionsFile<T>(
  csvFilePath: string,
  onRecord: (record: T) => TransactionWithoutAmountConverted,
  options?: { customEncoding?: string; delimiter?: string },
): TransactionWithoutAmountConverted[] {
  let fileContent: string;

  if (options?.customEncoding != null) {
    const encoded = fs.readFileSync(csvFilePath, { encoding: null });
    fileContent = decode(encoded, options.customEncoding);
  } else {
    fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  }

  return parse(fileContent.trim(), {
    columns: true,
    delimiter: options?.delimiter ?? ",",
    onRecord,
    trim: true,
  });
}
