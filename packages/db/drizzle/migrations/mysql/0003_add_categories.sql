-- Add categories table
CREATE TABLE IF NOT EXISTS `categories` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	UNIQUE KEY `categories_name_unique` (`name`),
	UNIQUE KEY `categories_slug_unique` (`slug`)
);

-- Add category_id to posts table (idempotent)
SET @exist_check = (SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                    AND table_name = 'posts'
                    AND column_name = 'category_id');

SET @sql = IF(@exist_check = 0,
    'ALTER TABLE `posts` ADD COLUMN `category_id` int',
    'SELECT ''Column already exists'' AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
