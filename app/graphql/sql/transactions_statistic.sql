DROP VIEW transactions_statistic;

CREATE VIEW transactions_statistic AS
SELECT
  COALESCE(
    income.monthId || '-' || income.categoryId,
    outcome.monthId || '-' || outcome.categoryId
  ) AS id,
  COALESCE(income.monthId, outcome.monthId) AS monthId,
  COALESCE(income.sum, 0) AS income,
  COALESCE(outcome.sum, 0) AS outcome,
  COALESCE(income.categoryId, outcome.categoryId) AS categoryId
FROM
  (
    SELECT
      strftime (
        "%Y-%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS monthId,
      SUM(t2c.amount) AS sum,
      t2c.categoryId
    FROM
      transactions t
      JOIN transactions2categories t2c ON t2c.transactionId = t.id
    WHERE
      t2c.amount > 0
    GROUP BY
      monthId,
      categoryId
  ) AS income
  FULL OUTER JOIN (
    SELECT
      strftime (
        "%Y-%m",
        datetime (t.date / 1000, 'unixepoch', 'localtime')
      ) AS monthId,
      SUM(t2c.amount) AS sum,
      t2c.categoryId
    FROM
      transactions t
      JOIN transactions2categories t2c ON t2c.transactionId = t.id
    WHERE
      t2c.amount < 0
    GROUP BY
      monthId,
      categoryId
  ) AS outcome ON income.monthId = outcome.monthId
  AND income.categoryId = outcome.categoryId
ORDER BY
  monthId DESC;
