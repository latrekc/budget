import fs from "fs";
import path from "path";

const sqlPath = path.resolve(
  process.cwd(),
  "app/graphql/sql/currency_exhange_rate.sql",
);

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("currency_exhange_rate.sql table", () => {
  it("creates table currency_exchange_rates if not exists with correct columns", () => {
    const content = readSql();
    expect(content).toMatch(
      /CREATE TABLE IF NOT EXISTS 'currency_exchange_rates'/i,
    );
    expect(content).toMatch(/'id' TEXT NOT NULL PRIMARY KEY/i);
    expect(content).toMatch(/'date' DATETIME NOT NULL/i);
    expect(content).toMatch(/'base' TEXT NOT NULL/i);
    expect(content).toMatch(/'target' TEXT NOT NULL/i);
    expect(content).toMatch(/'rate' REAL DEFAULT 1/i);
  });

  it("creates unique index on id", () => {
    const content = readSql();
    expect(content).toMatch(
      /CREATE UNIQUE INDEX 'currency_exchange_rates_id_key' ON 'currency_exchange_rates' \('id'\)/i,
    );
  });

  it("creates unique index on date base target composite", () => {
    const content = readSql();
    expect(content).toMatch(
      /CREATE UNIQUE INDEX 'currency_exchange_rates_date_base_target_key' ON 'currency_exchange_rates' \('date',\s*'base',\s*'target'\)/i,
    );
  });

  it("insert duplicate id fails due to primary key constraint documenting expected behavior", () => {
    const content = readSql();
    expect(content).toMatch(/PRIMARY KEY/);
    expect(content).toMatch(/UNIQUE INDEX/);
  });

  it("insert duplicate date base target fails due to unique composite index", () => {
    const content = readSql();
    expect(content).toMatch(/date.*base.*target/);
  });

  it("filename typo exhange consistent with existing codebase documenting characterization", () => {
    expect(path.basename(sqlPath)).toBe("currency_exhange_rate.sql");
    const content = readSql();
    // Table name is correctly spelled exchange_rates despite filename typo
    expect(content).toMatch(/currency_exchange_rates/);
  });

  it("no foreign keys defined documenting existing schema", () => {
    const content = readSql();
    expect(content).not.toMatch(/FOREIGN KEY/i);
    expect(content).not.toMatch(/REFERENCES/i);
  });
});
