import { Source, Transaction, Currency } from "./types";

const transactions: Transaction[] = [
  {
    id: "tx_00009rXoGkbMBUz8e4Up9u",
    source: Source.Monzo,
    date: new Date(1580432516000),
    description: "THREADS STYLING LT",
    amount: 6265.74,
    currency: Currency.GBP,
  },
  {
    id: "tx_00009rd907bSTtUTPCKurB",
    source: Source.Monzo,
    date: new Date(1580654908000),
    description: "SPORTSDIRECT.COM LONDON GBR",
    amount: -24.99,
    currency: Currency.GBP,
  },
  {
    id: "57059d21dd7931371ee4b0f10e95ef918018f2b7",
    source: Source.Revolut,
    date: new Date(1578854181000),
    description: "Top-Up by *8703",
    amount: 100,
    currency: Currency.GBP,
  },

  {
    id: "2022121932022353155026300110000",
    source: Source.HSBC,
    date: new Date(1671408000000),
    description: "SAINSBURYS S/MKTS HACKNEY-WOODB VIS",
    amount: -29.25,
    currency: Currency.GBP,
  },
  {
    id: "2022120532022339050837189560000",
    source: Source.HSBC,
    date: new Date(1670198400000),
    description: "Stanislav Tugoviko CR",
    amount: 1000,
    currency: Currency.GBP,
  },
  {
    id: "d7fa7013f5ab4a1d3c89494d8a33b6d47ec0685d",
    source: Source.Revolut,
    date: new Date(1578945734000),
    description: "To Stanislav Tugovikov",
    amount: -50,
    currency: Currency.GBP,
  },
];

export default transactions;
