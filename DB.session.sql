SELECT
  description
FROM
  transactions
WHERE
  source = 'HSBC'
  AND description LIKE '%account';
