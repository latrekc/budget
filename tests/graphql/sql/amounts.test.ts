import fs from "fs";
import path from "path";

const sqlPath = path.resolve(process.cwd(), "app/graphql/sql/amounts.sql");

function readSql(): string {
  return fs.readFileSync(sqlPath, "utf-8");
}

describe("amounts.sql migration", () => {
  it("file exists and is non empty", () => {
    const content = readSql();
    expect(content.length).toBeGreaterThan(0);
  });

  it("renames transactions amount to old_amount then adds amount INT default 0", () => {
    const content = readSql();
    expect(content).toMatch(
      /ALTER TABLE transactions\s+RENAME COLUMN amount TO old_amount/i,
    );
    expect(content).toMatch(
      /ALTER TABLE transactions\s+ADD COLUMN amount INT DEFAULT 0/i,
    );
  });

  it("updates transactions amount as round old_amount times 100", () => {
    const content = readSql();
    expect(content).toMatch(
      /UPDATE transactions[\s\S]*amount\s*=\s*ROUND\(old_amount \* 100/i,
    );
  });

  it("drops old_amount column after migration for transactions", () => {
    const content = readSql();
    const transactionsSection = content.split("-- transactions2categories")[0];
    expect(transactionsSection).toMatch(
      /ALTER TABLE transactions\s+DROP COLUMN old_amount/i,
    );
  });

  it("applies same rename add update drop pattern to transactions2categories", () => {
    const content = readSql();
    expect(content).toMatch(
      /ALTER TABLE transactions2categories\s+RENAME COLUMN amount TO old_amount/i,
    );
    expect(content).toMatch(
      /ALTER TABLE transactions2categories\s+ADD COLUMN amount INT DEFAULT 0/i,
    );
    expect(content).toMatch(
      /UPDATE transactions2categories[\s\S]*amount\s*=\s*ROUND\(old_amount \* 100/i,
    );
    expect(content).toMatch(
      /ALTER TABLE transactions2categories\s+DROP COLUMN old_amount/i,
    );
  });

  it("adds amount_converted INT to transactions table", () => {
    const content = readSql();
    expect(content).toMatch(
      /ALTER TABLE transactions\s+ADD COLUMN amount_converted INT/i,
    );
  });

  it("adds amount_converted INT to transactions2categories table but does not populate it", () => {
    const content = readSql();
    expect(content).toMatch(
      /ALTER TABLE transactions2categories\s+ADD COLUMN amount_converted INT/i,
    );
    const t2cSection =
      content.split("ALTER TABLE transactions2categories")[2] || "";
    // No UPDATE for t2c amount_converted in file - characterization of existing bug
    expect(t2cSection).not.toMatch(
      /UPDATE[\s\S]*transactions2categories[\s\S]*amount_converted\s*=/i,
    );
  });

  it("sets amount_converted equals amount where currency GBP using UPDATE TABLE syntax documenting existing bug", () => {
    const content = readSql();
    // Existing file contains invalid "UPDATE TABLE" syntax - characterization test captures current behavior
    expect(content).toMatch(
      /UPDATE TABLE transactions\s+SET\s+amount_converted\s*=\s*amount\s+WHERE\s+currency\s*=\s*'GBP'/i,
    );
  });

  it("does not backfill amount_converted for non GBP currencies leaving null", () => {
    const content = readSql();
    // Only GBP case present, no ELSE or other currency handling
    const matches = content.match(/amount_converted\s*=\s*amount/g) || [];
    expect(matches).toHaveLength(1);
    expect(content).not.toMatch(/WHERE\s+currency\s*!=\s*'GBP'/i);
    expect(content).not.toMatch(/WHERE\s+currency\s+IN/i);
  });

  it("migration runs amounts multiplied by 100 capturing integer cents conversion", () => {
    const content = readSql();
    const roundMatches = content.match(/ROUND\(old_amount \* 100/g) || [];
    expect(roundMatches).toHaveLength(2); // transactions and transactions2categories
  });
});
