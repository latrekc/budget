-- transactions
ALTER TABLE transactions
RENAME COLUMN amount TO old_amount;

ALTER TABLE transactions
ADD COLUMN amount INT DEFAULT 0;

UPDATE transactions
SET
  amount = ROUND(old_amount * 100, 0);

ALTER TABLE transactions
DROP COLUMN old_amount;

-- transactions2categories
ALTER TABLE transactions2categories
RENAME COLUMN amount TO old_amount;

ALTER TABLE transactions2categories
ADD COLUMN amount INT DEFAULT 0;

UPDATE transactions2categories
SET
  amount = ROUND(old_amount * 100, 0);

ALTER TABLE transactions2categories
DROP COLUMN old_amount;
