#!/usr/bin/env ts-node-script
import { Command, InvalidArgumentError } from "commander";
import { parse } from "csv-parse/sync";
import { parse as parseDate } from "date-format-parse";
import * as fs from "fs";
import * as path from "path";
import prisma from "../lib/prisma";
import {
  DEFAULT_CURRENCY,
  getUTCDateString,
  getUTCStartOfDate,
  NonDefaultCurrency,
} from "../lib/types";
const program = new Command();

type ExchangeRateRecord = {
  date: Date;
  rates: Record<NonDefaultCurrency, number>;
};

program
  .description("CLI to import currency exchange rates into a database")
  .version("0.8.0");

program
  .command("import-year")
  .description(
    "Import currency exchange rates for a selected year from <root>/scripts/exschange-rates/<year>.csv",
  )
  .argument(
    "<year>",
    "Selected year file",
    (year: string): [number, string] => {
      if (!year.match(/^20[0-9]{2}$/)) {
        throw new InvalidArgumentError(`Invalid year ${year}`);
      }

      const csvFilePath = path.resolve(__dirname, `exchange-rates/${year}.csv`);
      if (!fs.existsSync(csvFilePath)) {
        throw new InvalidArgumentError(`${csvFilePath} does not exist`);
      }

      return [parseInt(year, 10), csvFilePath];
    },
  )
  .action(async ([year, csvFilePath]: [number, string]) => {
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    const data: ExchangeRateRecord[] = parse(fileContent, {
      columns: true,
      delimiter: ",",
      onRecord: (record: {
        Date: string;
        USD: string;
        EUR: string;
        RUB: string;
      }): ExchangeRateRecord => ({
        date: getUTCStartOfDate(parseDate(record.Date, "DD/MM/YYYY")),
        rates: {
          USD: parseFloat(record.USD),
          EUR: parseFloat(record.EUR),
          RUB: parseFloat(record.EUR),
        },
      }),
      trim: true,
    });

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.currencyExchangeRate.deleteMany({
        where: {
          date: {
            gte: getUTCStartOfDate(new Date(year, 0, 1)),
            lt: getUTCStartOfDate(new Date(year + 1, 0, 1)),
          },
        },
      });
      console.log(`Deleted ${deleted.count} records`);

      const imported = await tx.currencyExchangeRate.createMany({
        data: data.flatMap(({ date, rates }) =>
          Object.entries(rates).map(([currency, rate]) => ({
            base: DEFAULT_CURRENCY,
            date: date.toISOString(),
            id: `${DEFAULT_CURRENCY}-${currency}-${getUTCDateString(date)}`,
            rate,
            target: currency,
          })),
        ),
      });

      console.log(`Imported ${imported.count} records for ${year}`);
    });
  });

program.parse();
