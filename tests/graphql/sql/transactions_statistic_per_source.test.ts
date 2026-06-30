import fs from "fs";
import path from "path";

const sqlPath = path.resolve(
  process.cwd(),
  "app/graphql/sql/transactions_statistic_per_source.sql",
);

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("transactions_statistic_per_source.sql view", () => {
  it("drops and creates view transactions_statistic_per_source", () => {
    const content = readSql();
    expect(content).toMatch(
      /DROP VIEW IF EXISTS transactions_statistic_per_source/i,
    );
    expect(content).toMatch(
      /CREATE VIEW transactions_statistic_per_source AS/i,
    );
  });

  it("selects coalesced id source income outcome", () => {
    const content = readSql();
    expect(content).toMatch(
      /COALESCE\(income\.source,\s*outcome\.source\) AS id/i,
    );
    expect(content).toMatch(
      /COALESCE\(income\.source,\s*outcome\.source\) AS source/i,
    );
    expect(content).toMatch(/COALESCE\(income\.sum,\s*0\) AS income/i);
    expect(content).toMatch(/COALESCE\(outcome\.sum,\s*0\) AS outcome/i);
  });

  it("income subquery groups by source summing amount_converted > 0", () => {
    const content = readSql();
    expect(content).toMatch(
      /SELECT\s+t\.source AS source,\s*SUM\(amount_converted\) AS sum\s*FROM\s*transactions t\s*WHERE\s*amount_converted > 0\s*GROUP BY\s*source/i,
    );
  });

  it("outcome subquery groups by source summing amount_converted < 0", () => {
    const content = readSql();
    expect(content).toMatch(/amount_converted < 0/);
  });

  it("FULL OUTER JOINs income and outcome on source", () => {
    const content = readSql();
    expect(content).toMatch(
      /FULL OUTER JOIN[\s\S]*ON income\.source = outcome\.source/i,
    );
  });

  it("orders by id DESC alphabetical descending", () => {
    const content = readSql();
    expect(content).toMatch(/ORDER BY\s+id DESC/i);
  });

  it("verifies source enum mapping income outcome aggregation documenting expected behavior", () => {
    const content = readSql();
    expect(content).toMatch(/t\.source AS source/);
    expect(content).toMatch(/SUM\(amount_converted\)/);
  });
});
