DROP VIEW transactions_statistic_per_source;

CREATE VIEW transactions_statistic_per_source AS
SELECT
  COALESCE(income.source, outcome.source) AS id,
  COALESCE(income.source, outcome.source) AS source,
  COALESCE(income.sum, 0) AS income,
  COALESCE(outcome.sum, 0) AS outcome
FROM
  (
    SELECT
      t.source AS source,
      SUM(quantity) AS sum
    FROM
      transactions t
    WHERE
      quantity > 0
    GROUP BY
      source
  ) AS income
  FULL OUTER JOIN (
    SELECT
      t.source AS source,
      SUM(quantity) AS sum
    FROM
      transactions t
    WHERE
      quantity < 0
    GROUP BY
      source
  ) AS outcome ON income.source = outcome.source
ORDER BY
  id DESC;
