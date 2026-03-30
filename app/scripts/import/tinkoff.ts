import { Command } from "commander";
import { parse as parseDate } from "date-format-parse";
import hash from "object-hash";
import { Currency, enumFromStringValue, Source } from "../../lib/types";
import {
  parsePathToCsvFile,
  parseTransactionsFile,
  upsertTransactions,
} from "./utils";

export const parseTinkoff = (program: Command) =>
  program
    .command("tinkoff")
    .description("Import Tinkoff transactions")
    .argument("<path>", "path to Tinkoff export file", parsePathToCsvFile)
    .action(async (csvFilePath: string) => {
      const records = parseTransactionsFile<{
        MCC: string;
        "Бонусы (включая кэшбэк)": string;
        "Валюта операции": string;
        "Валюта платежа": string;
        "Дата операции": string;
        "Дата платежа": string;
        Категория: string;
        Кэшбэк: string;
        "Номер карты": string;
        "Округление на инвесткопилку": string;
        Описание: string;
        Статус: string;
        "Сумма операции": string;
        "Сумма операции с округлением": string;
        "Сумма платежа": string;
      }>(
        csvFilePath,
        (record) => ({
          amount: Math.round(parseFloat(record["Сумма операции"]) * 100),
          currency: enumFromStringValue(Currency, record["Валюта операции"]),
          date: parseDate(record["Дата операции"], "DD.MM.YYYY"),
          description: record["Описание"],
          id: hash(record),
          source: Source.Tinkoff,
        }),
        { customEncoding: "cp1251", delimiter: ";" },
      );

      await upsertTransactions(Source.Tinkoff, records);
    });
