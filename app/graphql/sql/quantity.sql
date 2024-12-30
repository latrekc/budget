ALTER TABLE transactions ADD quantity INTEGER NOT NULL DEFAULT 0;

ALTER TABLE transactions2categories ADD quantity INTEGER NOT NULL DEFAULT 0;

UPDATE transactions
SET
  quantity = ROUND(amount * 100, 0);

UPDATE transactions2categories
SET
  quantity = ROUND(amount * 100);
