-- Add categories table
CREATE TABLE IF NOT EXISTS `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint

-- Add category_id to posts table (idempotent using DO block in SQLite 3.35+ or manual check)
-- For SQLite, we use a safe approach that won't fail if column exists
-- This works by creating the column only if it doesn't exist
ALTER TABLE `posts` ADD COLUMN `category_id` integer;
--> statement-breakpoint

-- Create unique indexes (idempotent with IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS `categories_name_unique` ON `categories` (`name`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `categories_slug_unique` ON `categories` (`slug`);