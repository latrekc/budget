CREATE TABLE IF NOT EXISTS "currency_exchange_rates" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "date" DATETIME NOT NULL,
  "base" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "rate" REAL DEFAULT 1
);

CREATE UNIQUE INDEX "currency_exchange_rates_id_key" ON "currency_exchange_rates" ("id");

CREATE UNIQUE INDEX "currency_exchange_rates_date_base_target_key" ON "currency_exchange_rates" ("date", "base", "target");
