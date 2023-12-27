DROP VIEW transactions_statistic_per_months;

CREATE VIEW transactions_statistic_per_months AS
SELECT
  (income.year || '-' || income.month) AS id,
  income.year,
  income.month,
  income.sum AS income,
  outcome.sum AS outcome
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
      SUM(amount * 100) / 100 AS sum
    FROM
      transactions t
    WHERE
      amount > 0
    GROUP BY
      year,
      month
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
      SUM(amount * 100) / 100 AS sum
    FROM
      transactions t
    WHERE
      amount < 0
    GROUP BY
      year,
      month
  ) AS outcome ON income.year = outcome.year
  AND income.month = outcome.month
ORDER BY
  outcome.year DESC,
  outcome.month DESC;
