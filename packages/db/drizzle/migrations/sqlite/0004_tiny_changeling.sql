CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_name` text DEFAULT 'VeloCMS',
	`site_description` text,
	`site_url` text,
	`language` text DEFAULT 'zh-CN',
	`author_name` text,
	`author_email` text,
	`author_bio` text,
	`meta_title` text,
	`meta_description` text,
	`meta_keywords` text,
	`twitter_handle` text,
	`github_handle` text,
	`email_notifications` integer DEFAULT true,
	`comment_notifications` integer DEFAULT true,
	`updated_at` integer
);
