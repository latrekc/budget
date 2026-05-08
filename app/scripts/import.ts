#!/usr/bin/env ts-node-script
import { Command } from "commander";

import { parseBarclays } from "./import/barclays";
import { parseBarclaysAmazon } from "./import/barclays-amazon";
import { parseHsbc } from "./import/hsbc";
import { parseMonzo } from "./import/monzo";
import { parseRevolut } from "./import/revolut";
import { parseSberbank } from "./import/sberbank";
import { parseTinkoff } from "./import/tinkoff";
import { parseWise } from "./import/wise";

const program = new Command();

program
  .description("CLI to import bank transactions into a database")
  .version("0.8.0");

[
  parseMonzo,
  parseTinkoff,
  parseRevolut,
  parseWise,
  parseHsbc,
  parseBarclays,
  parseBarclaysAmazon,
  parseSberbank,
].forEach((parser) => parser(program));

program.parse();
