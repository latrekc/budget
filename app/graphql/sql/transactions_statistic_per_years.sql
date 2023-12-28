DROP VIEW transactions_statistic_per_years;

CREATE VIEW transactions_statistic_per_years AS
SELECT
  income.year AS id,
  income.year,
  income.sum AS income,
  outcome.sum AS outcome
FROM
  (
    SELECT
      strftime (
        "%Y",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS year,
      SUM(amount * 100) / 100 AS sum
    FROM
      transactions t
    WHERE
      amount > 0
    GROUP BY
      year
  ) AS income
  RIGHT OUTER JOIN (
    SELECT
      strftime (
        "%Y",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS year,
      SUM(amount * 100) / 100 AS sum
    FROM
      transactions t
    WHERE
      amount < 0
    GROUP BY
      year
  ) AS outcome ON income.year = outcome.year
ORDER BY
  outcome.year DESC;
