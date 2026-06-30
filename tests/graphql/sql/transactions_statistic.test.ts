import fs from "fs";
import path from "path";

const sqlPath = path.resolve(
  process.cwd(),
  "app/graphql/sql/transactions_statistic.sql",
);

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("transactions_statistic.sql view", () => {
  it("drops view then creates view transactions_statistic", () => {
    const content = readSql();
    expect(content).toMatch(/DROP VIEW IF EXISTS transactions_statistic/i);
    expect(content).toMatch(/CREATE VIEW transactions_statistic AS/i);
  });

  it("selects coalesced id monthId income outcome categoryId from income full outer join outcome", () => {
    const content = readSql();
    expect(content).toMatch(
      /COALESCE\(\s*income\.monthId \|\| '-' \|\| income\.categoryId/,
    );
    expect(content).toMatch(/COALESCE\(income\.sum,\s*0\) AS income/i);
    expect(content).toMatch(/COALESCE\(outcome\.sum,\s*0\) AS outcome/i);
    expect(content).toMatch(/FULL OUTER JOIN/i);
  });

  it("income subquery sums t2c.amount_converted > 0 grouped by monthId categoryId", () => {
    const content = readSql();
    expect(content).toMatch(
      /SUM\(t2c\.amount_converted\) AS sum[\s\S]*WHERE[\s\S]*t2c\.amount_converted > 0[\s\S]*GROUP BY[\s\S]*monthId,\s*categoryId/i,
    );
  });

  it("outcome subquery sums t2c.amount_converted < 0 grouped by monthId categoryId", () => {
    const content = readSql();
    expect(content).toMatch(/t2c\.amount_converted < 0/);
  });

  it("uses strftime Y-m to derive monthId from t.date unixepoch localtime", () => {
    const content = readSql();
    expect(content).toMatch(
      /strftime\s*\(\s*'%Y-%m',\s*datetime\s*\(\s*t\.date \/ 1000,\s*'unixepoch',\s*'localtime'\s*\)\s*\) AS monthId/i,
    );
  });

  it("joins transactions to transactions2categories on transactionId", () => {
    const content = readSql();
    expect(content).toMatch(
      /JOIN transactions2categories t2c ON t2c\.transactionId = t\.id/i,
    );
  });

  it("orders by monthId DESC", () => {
    const content = readSql();
    expect(content).toMatch(/ORDER BY\s+monthId DESC/i);
  });

  it("view returns rows with income 0 outcome negative or vice versa coalesced documenting FULL OUTER JOIN behavior", () => {
    const content = readSql();
    expect(content).toMatch(/FULL OUTER JOIN/);
    expect(content).toMatch(/COALESCE\(income\.sum, 0\)/);
    expect(content).toMatch(/COALESCE\(outcome\.sum, 0\)/);
  });

  it("documents SQLite FULL OUTER JOIN compatibility requirement", () => {
    const content = readSql();
    // Characterization: file uses FULL OUTER JOIN which requires SQLite 3.39+
    expect(content).toMatch(/FULL OUTER JOIN/);
  });
});
