import { Command } from "commander";
import { parse as parseDate } from "date-format-parse";
import * as fs from "fs";
import hash from "object-hash";
import * as path from "path";
import {
  Currency,
  enumFromStringValue,
  Source,
  TransactionWithoutAmountConverted,
} from "../../lib/types";
import {
  parsePathToCSVDirectory,
  parseTransactionsFile,
  upsertTransactions,
} from "./utils";

export const parseSberbank = (program: Command) =>
  program
    .command("sberbank")
    .description("Import Sberbank transactions")
    .argument(
      "<path>",
      "path to a SBERBANK directory with CSV files",
      parsePathToCSVDirectory,
    )
    .action(async (directoryPath: string) => {
      const records: TransactionWithoutAmountConverted[] = [];
      fs.readdirSync(directoryPath)
        .filter((value) => value.endsWith(".csv"))
        .map((filePath) => path.resolve(directoryPath, filePath))
        .forEach(async (filePath) => {
          records.push(
            ...parseTransactionsFile<{
              "Валюта операции": string;
              "Город совершения операции": string;
              "Дата обработки операции": string;
              "Дата совершения операции": string;
              "Код авторизации": string;
              "Номер карты": string;
              Описание: string;
              "Страна совершения операции": string;
              "Сумма в валюте операции": string;
              "Сумма в валюте счета": string;
              "Тип карты": string;
              "Тип операции": string;
            }>(
              filePath,
              (record) => ({
                amount: Math.round(
                  parseFloat(
                    record["Сумма в валюте операции"].length > 0
                      ? record["Сумма в валюте операции"]
                      : record["Сумма в валюте счета"],
                  ) * 100,
                ),
                currency: enumFromStringValue(
                  Currency,
                  record["Валюта операции"].length > 0
                    ? record["Валюта операции"]
                    : Currency.RUB,
                ),
                date: parseDate(
                  record["Дата совершения операции"],
                  "DD.MM.YYYY",
                ),
                description: record["Описание"],
                id: hash(record),
                source: Source.Sberbank,
              }),
              { delimiter: ";" },
            ),
          );
        });
      await upsertTransactions(Source.Sberbank, records);
    });
