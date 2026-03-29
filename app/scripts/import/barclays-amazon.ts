import { Command } from "commander";
import * as fs from "fs";
import {
  Currency,
  enumFromStringValue,
  Source,
  TransactionWithoutAmountConverted,
} from "../..//lib/types";
import { parsePathToJSONFile, upsertTransactions } from "./utils";

type BarclaysAmazonResponse = {
  error: boolean;
  httpStatus: number;
  responseBody: {
    data: {
      attributes: {
        declinedBanner: boolean;
        moreTxnsInTheLastGroup: boolean;
        pagination: {
          next: null | string;
        };
        transactionGroups: {
          labelShort: string;
          totalAmount: {
            currency: string;
            value: string;
          };
          transactions: {
            amount: {
              currency: string;
              value: string;
            };
            category: null;
            dateTime: string;
            heading: string;
            id: null | string;
            logo: null | string;
            status: string;
            subheading: string;
            supplementaryInfo: null;
            transactionDate: null | string;
          }[];
        }[];
      };
      id: string;
      type: string;
    };
  };
};

export const parseBarclaysAmazon = (program: Command) =>
  program
    .command("barclays-amazon")
    .description("Import Barclays Amazon transactions (JSON export format)")
    .argument("<path>", "path to Barclays export file", parsePathToJSONFile)
    .action(async (jsonFilePath: string) => {
      const content = fs.readFileSync(jsonFilePath, "utf-8");
      const response: BarclaysAmazonResponse = JSON.parse(content);

      const records: TransactionWithoutAmountConverted[] =
        response.responseBody.data.attributes.transactionGroups.flatMap(
          (group) =>
            group.transactions
              .filter(
                (transaction) =>
                  transaction.status !== "PERNDING" &&
                  transaction.dateTime != null &&
                  transaction.id != null,
              )
              .map((transaction) => ({
                amount: -Math.round(
                  (parseFloat(transaction.amount.value) ?? 0) * 100,
                ),
                currency: enumFromStringValue(
                  Currency,
                  transaction.amount.currency,
                ),
                date: new Date(transaction.dateTime),
                description: transaction.heading,
                id: transaction.id!,
                source: Source.Barclays,
              })),
        );

      await upsertTransactions(Source.Barclays, records);
    });
