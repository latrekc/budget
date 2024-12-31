DROP VIEW currency_exchange_rate_clames;

CREATE VIEW currency_exchange_rate_clames AS
SELECT
  (
    currency || '-' || strftime (
      "%Y-%m-%d",
      datetime (t.date / 1000, 'unixepoch', 'localtime')
    )
  ) AS id,
  t.currency,
  (
    unixepoch (
      t.date / 1000,
      'unixepoch',
      'localtime',
      'start of day'
    ) * 1000
  ) AS date
FROM
  transactions t
  LEFT OUTER JOIN currency_exchange_rates c ON t.currency = c.target
  AND unixepoch (
    t.date / 1000,
    'unixepoch',
    'localtime',
    'start of day'
  ) = unixepoch (
    c.date / 1000,
    'unixepoch',
    'localtime',
    'start of day'
  )
WHERE
  c.id IS NULL
GROUP BY
  (
    currency || '-' || strftime (
      "%Y-%m-%d",
      datetime (t.date / 1000, 'unixepoch', 'localtime')
    )
  )
ORDER BY
  id DESC;
