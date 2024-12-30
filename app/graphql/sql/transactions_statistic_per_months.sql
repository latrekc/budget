DROP VIEW transactions_statistic_per_months;

CREATE VIEW transactions_statistic_per_months AS
SELECT
  COALESCE(income.monthId, outcome.monthId) AS id,
  COALESCE(income.year, outcome.year) AS year,
  COALESCE(income.month, outcome.month) AS month,
  COALESCE(income.sum, 0) AS income,
  COALESCE(outcome.sum, 0) AS outcome
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
      strftime (
        "%Y-%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS monthId,
      SUM(quantity) AS sum
    FROM
      transactions t
    WHERE
      quantity > 0
    GROUP BY
      monthId,
      year,
      month
  ) AS income
  FULL OUTER JOIN (
    SELECT
      strftime (
        "%Y",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS year,
      strftime (
        "%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS month,
      strftime (
        "%Y-%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS monthId,
      SUM(quantity) AS sum
    FROM
      transactions t
    WHERE
      quantity < 0
    GROUP BY
      monthId,
      year,
      month
  ) AS outcome ON income.monthId = outcome.monthId
ORDER BY
  id DESC;
