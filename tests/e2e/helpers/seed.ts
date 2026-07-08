// Deterministic, idempotent seed for the Playwright E2E suite.
//
// Every value is a pure function of an index — no Date.now / Math.random — so
// re-running the seed always produces byte-identical data. Dates are written
// through the env-driven Prisma client (timestampFormat "unixepoch-ms"), so
// passing JS Date objects stores epoch-ms integers as the app expects.
//
// Dates are stored at UTC noon so the SQL views' `datetime(..., 'localtime')`
// transform never shifts a transaction across a calendar-day boundary,
// regardless of the machine timezone.

import fs from "fs";
import path from "path";

import prisma from "../../../app/lib/prisma";
import { Currency, DEFAULT_CURRENCY, Source } from "../../../app/lib/types";

// The dashboard, months/sources filters and currency-claims read Prisma *views*
// that live as raw SQL in app/graphql/sql/. `prisma db push` only creates
// tables, so the views must be applied separately. Each file is idempotent
// (`DROP VIEW IF EXISTS` + `CREATE VIEW`), so we just run its statements.
const VIEW_FILES = [
  "currency_exchange_rate_clames.sql",
  "transactions_statistic_per_months.sql",
  "transactions_statistic_per_source.sql",
  "transactions_statistic.sql",
];

export async function applyViews(): Promise<void> {
  const sqlDir = path.resolve(process.cwd(), "app/graphql/sql");
  for (const file of VIEW_FILES) {
    const sql = fs.readFileSync(path.join(sqlDir, file), "utf-8");
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
  }
}

const SOURCES = [
  Source.Monzo,
  Source.Tinkoff,
  Source.Revolut,
  Source.Wise,
  Source.HSBC,
  Source.Barclays,
  Source.Sberbank,
  Source.Raiffeisen,
];

// Per-month currency pattern (length 11 == transactions per month). GBP is the
// default/most-common; the six non-GBP currencies appear once each per month.
const CURRENCY_PATTERN = [
  Currency.GBP,
  Currency.GBP,
  Currency.GBP,
  Currency.USD,
  Currency.EUR,
  Currency.RUB,
  Currency.GBP,
  Currency.GBP,
  Currency.HUF,
  Currency.JPY,
  Currency.TRY,
];

// GBP per one unit of the foreign currency.
const RATES: Record<string, number> = {
  [Currency.USD]: 0.78,
  [Currency.EUR]: 0.86,
  [Currency.RUB]: 0.011,
  [Currency.HUF]: 0.0022,
  [Currency.JPY]: 0.0055,
  [Currency.TRY]: 0.03,
};

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const PER_MONTH = CURRENCY_PATTERN.length; // 11
const DAYS = [3, 11, 19, 27];

// Deterministic 4-level category tree (multiple roots). Parents always precede
// their children (id-ascending) so a single multi-row insert satisfies the
// self-referencing foreign key.
const CATEGORIES: {
  id: number;
  name: string;
  parentCategoryId: number | null;
}[] = [
  { id: 1, name: "Living", parentCategoryId: null }, // L1
  { id: 2, name: "Income", parentCategoryId: null }, // L1
  { id: 3, name: "Leisure", parentCategoryId: null }, // L1
  { id: 4, name: "Transport", parentCategoryId: null }, // L1
  { id: 5, name: "Housing", parentCategoryId: 1 }, // L2
  { id: 6, name: "Food", parentCategoryId: 1 }, // L2
  { id: 7, name: "Work", parentCategoryId: 2 }, // L2
  { id: 8, name: "Entertainment", parentCategoryId: 3 }, // L2
  { id: 9, name: "Public", parentCategoryId: 4 }, // L2
  { id: 10, name: "Rent", parentCategoryId: 5 }, // L3
  { id: 11, name: "Utilities", parentCategoryId: 5 }, // L3
  { id: 12, name: "Groceries", parentCategoryId: 6 }, // L3
  { id: 13, name: "Coffee", parentCategoryId: 6 }, // L3
  { id: 14, name: "Salary", parentCategoryId: 7 }, // L3
  { id: 15, name: "Streaming", parentCategoryId: 8 }, // L3
  { id: 16, name: "Bus", parentCategoryId: 9 }, // L3
  { id: 17, name: "Deposit", parentCategoryId: 10 }, // L4 (great-grandchild)
  { id: 18, name: "Bonus", parentCategoryId: 14 }, // L4
];

// Expense (outcome) categories used for deterministic assignment.
const EXPENSE_CATEGORIES = [10, 11, 12, 13, 15, 16, 17];

// Generic descriptions that never contain the searchable keywords below.
const VOCAB = [
  "grocery shopping",
  "transport ticket",
  "utility bill",
  "online purchase",
  "restaurant dinner",
  "book store",
  "gym membership",
  "phone bill",
];

// Exact counts of the special search keywords (assigned to the first N ids).
const COFFEE_COUNT = 40;
const RENT_COUNT = 24;
const SALARY_COUNT = 16;

/** Stable expectations the specs can import to keep assertions deterministic. */
export const SEED = {
  perPage: 20,
  totalTransactions: YEARS.length * 12 * PER_MONTH, // 1056
  gapTransactions: 18, // non-GBP in 2019 Q1
  categoryLevels: 4,
  descriptions: {
    coffee: COFFEE_COUNT,
    rent: RENT_COUNT,
    salary: SALARY_COUNT,
  },
  currencies: {
    GBP: 480,
    USD: 96,
    EUR: 96,
    RUB: 96,
    HUF: 96,
    JPY: 96,
    TRY: 96,
  },
  // Distinct golden exchange-rate rows per currency: one per (year-month) — each
  // non-GBP currency recurs once a month on a fixed day — minus the 2019 Q1 gap
  // (3 months). 8 years * 12 - 3 = 93. Used by the infinite-scroll spec.
  rates: {
    USD: 93,
  },
  // Non-GBP transactions with no matching rate (the deliberate 2019 Q1 gap):
  // one per month for Jan/Feb/Mar 2019 = 3 per currency. Surfaced as "claims".
  claims: {
    USD: 3,
  },
  // Low-cardinality dataset written by seedSmall() for the mutation specs.
  small: {
    transactions: 8,
    usdRates: 1, // one USD rate (2024-01-15)
    usdClaims: 1, // one USD claim (2024-02-20, no matching rate)
  },
} as const;

type TransactionRow = {
  id: string;
  source: string;
  date: Date;
  description: string;
  amount: number;
  amount_converted: number | null;
  currency: string;
  completed: boolean;
};

type RateRow = {
  id: string;
  date: Date;
  base: string;
  target: string;
  rate: number;
};

type AssignmentRow = {
  transactionId: string;
  categoryId: number;
  amount: number;
  amount_converted: number;
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function describe(g: number): string {
  if (g < COFFEE_COUNT) {
    return `coffee run ${g}`;
  }
  if (g < COFFEE_COUNT + RENT_COUNT) {
    return `monthly rent ${g}`;
  }
  if (g < COFFEE_COUNT + RENT_COUNT + SALARY_COUNT) {
    return `salary payment ${g}`;
  }
  return `${VOCAB[g % VOCAB.length]} ${g}`;
}

type BuiltDataset = {
  transactions: TransactionRow[];
  rates: RateRow[];
  assignments: AssignmentRow[];
};

function buildLargeDataset(): BuiltDataset {
  const transactions: TransactionRow[] = [];
  const assignments: AssignmentRow[] = [];
  const ratesById = new Map<string, RateRow>();

  let g = 0;

  for (const year of YEARS) {
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      for (let k = 0; k < PER_MONTH; k++) {
        const currency = CURRENCY_PATTERN[k];
        const source = SOURCES[g % SOURCES.length];
        const day = DAYS[k % DAYS.length];
        const date = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
        const dayKey = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;

        const isIncome = g % 5 === 0;
        const magnitude = 1000 + (g % 60) * 113;
        const amount = isIncome ? magnitude : -magnitude;

        const isNonGbp = currency !== DEFAULT_CURRENCY;
        // Deliberate rate gap: non-GBP transactions in 2019 Q1 have no rate.
        const isGap = isNonGbp && year === 2019 && monthIndex <= 2;

        let amountConverted: number | null;
        if (!isNonGbp) {
          amountConverted = amount;
        } else if (isGap) {
          amountConverted = null;
        } else {
          amountConverted = Math.round(amount * RATES[currency]);
        }

        const categorized = g % 2 === 0 && !isGap;
        const id = `seed-${g.toString().padStart(4, "0")}`;

        transactions.push({
          id,
          source,
          date,
          description: describe(g),
          amount,
          amount_converted: amountConverted,
          currency,
          completed: categorized,
        });

        // A rate exists for every non-gap, non-GBP (currency, day).
        if (isNonGbp && !isGap) {
          const rateId = `${DEFAULT_CURRENCY}-${currency}-${dayKey}`;
          if (!ratesById.has(rateId)) {
            ratesById.set(rateId, {
              id: rateId,
              date,
              base: DEFAULT_CURRENCY,
              target: currency,
              rate: RATES[currency],
            });
          }
        }

        if (categorized && amountConverted != null) {
          const split = g % 8 === 0;

          let primary: number;
          let secondary: number;
          if (isIncome) {
            primary = 14; // Salary
            secondary = 18; // Bonus
          } else {
            primary = EXPENSE_CATEGORIES[g % EXPENSE_CATEGORIES.length];
            secondary = EXPENSE_CATEGORIES[(g + 3) % EXPENSE_CATEGORIES.length];
          }

          if (split) {
            const a1 = Math.trunc(amount / 2);
            const a2 = amount - a1;
            const c1 = Math.trunc(amountConverted / 2);
            const c2 = amountConverted - c1;
            assignments.push({
              transactionId: id,
              categoryId: primary,
              amount: a1,
              amount_converted: c1,
            });
            assignments.push({
              transactionId: id,
              categoryId: secondary,
              amount: a2,
              amount_converted: c2,
            });
          } else {
            assignments.push({
              transactionId: id,
              categoryId: primary,
              amount,
              amount_converted: amountConverted,
            });
          }
        }

        g++;
      }
    }
  }

  return {
    transactions,
    rates: [...ratesById.values()],
    assignments,
  };
}

async function wipe(
  tx: Pick<
    typeof prisma,
    | "transactionsOnCategories"
    | "transaction"
    | "category"
    | "currencyExchangeRate"
  >,
): Promise<void> {
  await tx.transactionsOnCategories.deleteMany();
  await tx.transaction.deleteMany();
  await tx.category.deleteMany();
  await tx.currencyExchangeRate.deleteMany();
}

/** Build the large deterministic golden dataset (idempotent). */
export async function seedLarge(): Promise<void> {
  const { transactions, rates, assignments } = buildLargeDataset();

  await prisma.$transaction(async (tx) => {
    await wipe(tx);
    await tx.category.createMany({ data: CATEGORIES });
    await tx.currencyExchangeRate.createMany({ data: rates });
    await tx.transaction.createMany({ data: transactions });
    await tx.transactionsOnCategories.createMany({ data: assignments });
  });
}

/**
 * Small, low-cardinality deterministic dataset for mutation specs. Assumes the
 * schema + views already exist (it only rewrites table rows).
 */
export async function seedSmall(): Promise<void> {
  const categories = [
    { id: 1, name: "Home", parentCategoryId: null },
    { id: 2, name: "Bills", parentCategoryId: 1 },
    { id: 3, name: "Power", parentCategoryId: 2 },
    { id: 4, name: "Earnings", parentCategoryId: null },
  ];

  const day = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
  const usdRateId = `${DEFAULT_CURRENCY}-${Currency.USD}-2024-01-15`;

  const rates = [
    {
      id: usdRateId,
      date: day,
      base: DEFAULT_CURRENCY,
      target: Currency.USD,
      rate: RATES[Currency.USD],
    },
  ];

  // 8 transactions: GBP + USD, categorized + uncategorised, plus a USD gap
  // (no rate -> appears as a claim / "Exchange rate is not defined").
  const gapDay = new Date(Date.UTC(2024, 1, 20, 12, 0, 0));
  const transactions: TransactionRow[] = [
    {
      id: "small-0",
      source: Source.Monzo,
      date: day,
      description: "coffee small",
      amount: -500,
      amount_converted: -500,
      currency: Currency.GBP,
      completed: true,
    },
    {
      id: "small-1",
      source: Source.Monzo,
      date: day,
      description: "rent small",
      amount: -120000,
      amount_converted: -120000,
      currency: Currency.GBP,
      completed: false,
    },
    {
      id: "small-2",
      source: Source.HSBC,
      date: day,
      description: "salary small",
      amount: 250000,
      amount_converted: 250000,
      currency: Currency.GBP,
      completed: false,
    },
    {
      id: "small-3",
      source: Source.Revolut,
      date: day,
      description: "groceries small",
      amount: -3000,
      amount_converted: -3000,
      currency: Currency.GBP,
      completed: false,
    },
    {
      id: "small-4",
      source: Source.Wise,
      date: day,
      description: "usd payment small",
      amount: -10000,
      amount_converted: Math.round(-10000 * RATES[Currency.USD]),
      currency: Currency.USD,
      completed: false,
    },
    {
      id: "small-5",
      source: Source.Wise,
      date: gapDay,
      description: "usd gap small",
      amount: -5000,
      amount_converted: null,
      currency: Currency.USD,
      completed: false,
    },
    {
      id: "small-6",
      source: Source.Barclays,
      date: day,
      description: "utility small",
      amount: -4500,
      amount_converted: -4500,
      currency: Currency.GBP,
      completed: false,
    },
    {
      id: "small-7",
      source: Source.Tinkoff,
      date: day,
      description: "bonus small",
      amount: 9000,
      amount_converted: 9000,
      currency: Currency.GBP,
      completed: false,
    },
  ];

  const assignments: AssignmentRow[] = [
    {
      transactionId: "small-0",
      categoryId: 3,
      amount: -500,
      amount_converted: -500,
    },
  ];

  await prisma.$transaction(async (tx) => {
    await wipe(tx);
    await tx.category.createMany({ data: categories });
    await tx.currencyExchangeRate.createMany({ data: rates });
    await tx.transaction.createMany({ data: transactions });
    await tx.transactionsOnCategories.createMany({ data: assignments });
  });
}

async function main(): Promise<void> {
  const small = process.argv.includes("--small");
  await applyViews();
  if (small) {
    await seedSmall();
  } else {
    await seedLarge();
  }
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
