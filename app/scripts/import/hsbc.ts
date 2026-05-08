import { OfxParser } from "@hublaw/ofx-parser";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import {
  Currency,
  Source,
  TransactionWithoutAmountConverted,
} from "../..//lib/types";
import { parsePathToOFXDirectory, upsertTransactions } from "./utils";

export const parseHsbc = (program: Command) =>
  program
    .command("hsbc")
    .description("Import HSBC transactions")
    .argument(
      "<path>",
      "path to a HSBC directory with ofx files",
      parsePathToOFXDirectory,
    )
    .action(async (directoryPath: string) => {
      const records: TransactionWithoutAmountConverted[] = [];
      const ofxParser = new OfxParser();

      const accountCurrencies = new Map([
        ["40010432086735", Currency.GBP],
        ["40100018059063", Currency.GBP],
        ["40119990719461", Currency.USD],
        ["40119990719539", Currency.USD],
        ["40119990876714", Currency.EUR],
        ["40126540108227", Currency.GBP],
      ]);

      fs.readdirSync(directoryPath)
        .filter((value) => value.endsWith(".ofx"))
        .map((filePath) => path.resolve(directoryPath, filePath))
        .forEach(async (filePath) => {
          const content = fs.readFileSync(filePath, "utf-8");
          const ofx = await ofxParser.parseStatement(content);

          const accountMatch = content.match(/<ACCTID>([0-9]+)<\/ACCTID>/);
          const accountId = (accountMatch || [])[1];

          const currency = accountCurrencies.get(accountId);

          if (currency == undefined) {
            console.error(`Unknown account ${accountId}`);
            process.exit();
          }

          ofx.transactions?.forEach((transaction) => {
            records.push({
              amount: Math.round((transaction.amount ?? 0) * 100),
              currency,
              date: transaction.datePosted ?? new Date(),
              description: [transaction.name, transaction.memo].join(" "),
              id: transaction.fitId ?? "",
              source: Source.HSBC,
            });
          });
        });

      await upsertTransactions(Source.HSBC, records);
    });
