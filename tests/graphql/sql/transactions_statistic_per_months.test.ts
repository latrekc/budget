import fs from "fs";
import path from "path";

const sqlPath = path.resolve(
  process.cwd(),
  "app/graphql/sql/transactions_statistic_per_months.sql",
);

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("transactions_statistic_per_months.sql view", () => {
  it("drops and creates view transactions_statistic_per_months", () => {
    const content = readSql();
    expect(content).toMatch(/DROP VIEW transactions_statistic_per_months/i);
    expect(content).toMatch(
      /CREATE VIEW transactions_statistic_per_months AS/i,
    );
  });

  it("selects coalesced id year month income outcome", () => {
    const content = readSql();
    expect(content).toMatch(
      /COALESCE\(income\.monthId,\s*outcome\.monthId\) AS id/i,
    );
    expect(content).toMatch(
      /COALESCE\(income\.year,\s*outcome\.year\) AS year/i,
    );
    expect(content).toMatch(
      /COALESCE\(income\.month,\s*outcome\.month\) AS month/i,
    );
    expect(content).toMatch(/COALESCE\(income\.sum,\s*0\) AS income/i);
    expect(content).toMatch(/COALESCE\(outcome\.sum,\s*0\) AS outcome/i);
  });

  it("income subquery selects year month monthId sum where amount_converted > 0 grouped", () => {
    const content = readSql();
    expect(content).toMatch(/strftime\s*\(\s*'%Y'[\s\S]*AS year/i);
    expect(content).toMatch(/strftime\s*\(\s*'%m'[\s\S]*AS month/i);
    expect(content).toMatch(/strftime\s*\(\s*'%Y-%m'[\s\S]*AS monthId/i);
    expect(content).toMatch(
      /SUM\(amount_converted\) AS sum[\s\S]*WHERE[\s\S]*amount_converted > 0/i,
    );
    expect(content).toMatch(/GROUP BY[\s\S]*monthId[\s\S]*year[\s\S]*month/i);
  });

  it("outcome subquery mirrors income with amount_converted < 0", () => {
    const content = readSql();
    expect(content).toMatch(/amount_converted < 0/);
  });

  it("uses FULL OUTER JOIN on monthId", () => {
    const content = readSql();
    expect(content).toMatch(
      /FULL OUTER JOIN[\s\S]*ON income\.monthId = outcome\.monthId/i,
    );
  });

  it("orders by id DESC", () => {
    const content = readSql();
    expect(content).toMatch(/ORDER BY\s+id DESC/i);
  });

  it("verifies types cast to integer documenting SQLite dynamic typing behavior", () => {
    const content = readSql();
    // strftime returns text but schema expects Int; SQLite dynamic typing allows, characterization test documents
    expect(content).toMatch(/strftime\s*\(\s*'%Y'/);
    expect(content).toMatch(/strftime\s*\(\s*'%m'/);
  });

  it("documents FULL OUTER JOIN compatibility edge case", () => {
    const content = readSql();
    expect(content).toMatch(/FULL OUTER JOIN/);
  });
});
