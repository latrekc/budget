import { OfxParser } from "@hublaw/ofx-parser";
import { Command } from "commander";
import * as fs from "fs";
import {
  Currency,
  enumFromStringValue,
  Source,
  TransactionWithoutAmountConverted,
} from "../..//lib/types";
import { parsePathToOfxFile, upsertTransactions } from "./utils";

export const parseBarclays = (program: Command) =>
  program
    .command("barclays")
    .description("Import Barclays transactions (OFX export format)")
    .argument("<path>", "path to Barclays export file", parsePathToOfxFile)
    .action(async (ofxFilePath: string) => {
      const records: TransactionWithoutAmountConverted[] = [];
      const ofxParser = new OfxParser();
      const content = fs.readFileSync(ofxFilePath, "utf-8");
      const ofx = await ofxParser.parseStatement(content);

      const currencyMatch = content.match(/<CURDEF>([A-Z]+)/);
      const currency = currencyMatch
        ? enumFromStringValue(Currency, currencyMatch[1])
        : Currency.GBP;

      ofx.transactions?.forEach((transaction) => {
        records.push({
          amount: Math.round((transaction.amount ?? 0) * 100),
          currency,
          date: transaction.datePosted ?? new Date(),
          description: [transaction.name, transaction.memo].join(" "),
          id: transaction.fitId ?? "",
          source: Source.Barclays,
        });
      });

      await upsertTransactions(Source.Barclays, records);
    });
