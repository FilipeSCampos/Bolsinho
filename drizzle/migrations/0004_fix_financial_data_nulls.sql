-- Migration: Fix financial data nulls
-- Description: Update investments table to ensure currentValue is not null
-- Date: 2025-11-12

-- Step 1: Update existing investments where currentValue is null or 0
-- Set currentValue to totalInvested if currentValue is null or 0
UPDATE `investments`
SET `currentValue` = `totalInvested`,
    `updatedAt` = CURRENT_TIMESTAMP
WHERE (`currentValue` IS NULL OR `currentValue` = 0)
  AND `totalInvested` > 0;

-- Step 2: Set currentValue to 0 for investments where totalInvested is also 0
UPDATE `investments`
SET `currentValue` = 0,
    `updatedAt` = CURRENT_TIMESTAMP
WHERE (`currentValue` IS NULL OR `currentValue` = 0)
  AND (`totalInvested` IS NULL OR `totalInvested` = 0);

-- Step 3: Alter table to make currentValue NOT NULL (if not already)
-- Note: This should work now that we've updated all null values
ALTER TABLE `investments`
MODIFY COLUMN `currentValue` INT NOT NULL DEFAULT 0;
