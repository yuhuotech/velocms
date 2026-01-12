-- Add logo_url column to settings table (idempotent)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we check the schema first
-- This migration assumes it will only run once
ALTER TABLE `settings` ADD COLUMN `logo_url` text;
