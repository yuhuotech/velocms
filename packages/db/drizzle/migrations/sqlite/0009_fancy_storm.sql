-- Rename order to sort_order in menus table
-- Note: RENAME COLUMN doesn't support IF EXISTS in SQLite
-- This will fail if column is already renamed, but that's expected
-- as migrations should only run once
ALTER TABLE `menus` RENAME COLUMN `order` TO `sort_order`;

-- Rename order to sort_order in pages table
ALTER TABLE `pages` RENAME COLUMN `order` TO `sort_order`;
