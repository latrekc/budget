DROP VIEW transactions_statistic;

CREATE VIEW transactions_statistic AS
SELECT
  (
    income.year || '-' || income.month || '-' || income.categoryId
  ) AS id,
  income.year,
  income.month,
  income.sum AS income,
  outcome.sum AS outcome,
  income.categoryId
FROM
  (
    SELECT
      strftime (
        "%Y",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS year,
      strftime (
        "%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS month,
      SUM(t2c.amount * 100) / 100 AS sum,
      t2c.categoryId
    FROM
      transactions t
      JOIN transactions2categories t2c ON t2c.transactionId = t.id
    WHERE
      t2c.amount > 0
    GROUP BY
      year,
      month,
      categoryId
  ) AS income
  RIGHT OUTER JOIN (
    SELECT
      strftime (
        "%Y",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS year,
      strftime (
        "%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS month,
      SUM(t2c.amount * 100) / 100 AS sum,
      t2c.categoryId
    FROM
      transactions t
      JOIN transactions2categories t2c ON t2c.transactionId = t.id
    WHERE
      t2c.amount < 0
    GROUP BY
      year,
      month,
      categoryId
  ) AS outcome ON income.year = outcome.year
  AND income.month = outcome.month
  AND income.categoryId = outcome.categoryId
ORDER BY
  outcome.year DESC,
  outcome.month DESC;
