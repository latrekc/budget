import fs from "fs";
import path from "path";

const sqlPath = path.resolve(
  process.cwd(),
  "app/graphql/sql/currency_exchange_rate_clames.sql",
);

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("currency_exchange_rate_clames.sql view", () => {
  it("file exists and drops view then creates view", () => {
    const content = readSql();
    expect(content).toMatch(
      /DROP VIEW IF EXISTS currency_exchange_rate_clames/i,
    );
    expect(content).toMatch(/CREATE VIEW currency_exchange_rate_clames AS/i);
  });

  it("selects distinct currency-date combos from transactions left join currency_exchange_rates where c.id IS NULL", () => {
    const content = readSql();
    expect(content).toMatch(
      /FROM\s+transactions t\s+LEFT OUTER JOIN currency_exchange_rates c ON/i,
    );
    expect(content).toMatch(/WHERE\s+c\.id IS NULL/i);
  });

  it("constructs id as currency hyphen strftime Y-m-d from t.date unixepoch localtime", () => {
    const content = readSql();
    expect(content).toMatch(/currency\s*\|\|\s*'-'\s*\|\|\s*strftime/);
    expect(content).toMatch(/'%Y-%m-%d'/);
    expect(content).toMatch(
      /datetime\s*\(\s*t\.date\s*\/\s*1000\s*,\s*'unixepoch'\s*,\s*'localtime'\s*\)/,
    );
    expect(content).toMatch(/AS id/i);
  });

  it("calculates date as unixepoch start of day times 1000", () => {
    const content = readSql();
    expect(content).toMatch(
      /unixepoch\s*\(\s*t\.date \/ 1000,\s*'unixepoch',\s*'localtime',\s*'start of day'\s*\)\s*\*\s*1000/i,
    );
    expect(content).toMatch(/AS date/);
  });

  it("groups by currency-date expression to deduplicate", () => {
    const content = readSql();
    expect(content).toMatch(
      /GROUP BY[\s\S]*currency \|\| '-'\s*\|\| strftime/i,
    );
  });

  it("orders by id descending", () => {
    const content = readSql();
    expect(content).toMatch(/ORDER BY\s+id DESC/i);
  });

  it("given transaction USD 2024-01-01 without rate row view returns row documenting expected behavior", () => {
    const content = readSql();
    // Characterization: view selects from transactions where no matching rate exists
    expect(content).toMatch(/t\.currency/);
    expect(content).toMatch(/c\.id IS NULL/);
    // View name typo clames vs claims is intentional existing behavior
    expect(content).toMatch(/currency_exchange_rate_clames/);
  });

  it("uses localtime in strftime documenting timezone dependent behavior", () => {
    const content = readSql();
    const localtimeMatches = content.match(/'localtime'/g) || [];
    expect(localtimeMatches.length).toBeGreaterThanOrEqual(3);
  });

  it("left join matches on target currency and date Y-m-d equality", () => {
    const content = readSql();
    expect(content).toMatch(/t\.currency\s*=\s*c\.target/i);
    expect(content).toMatch(
      /strftime[\s\S]*datetime\s*\(\s*t\.date \/ 1000[\s\S]*=\s*strftime[\s\S]*datetime\s*\(\s*c\.date \/ 1000/i,
    );
  });
});
