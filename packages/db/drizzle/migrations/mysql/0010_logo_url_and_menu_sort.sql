-- Add logo_url column to settings table (idempotent)
ALTER TABLE `settings` ADD COLUMN `logo_url` text;
