CREATE TABLE `menus` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`order` int DEFAULT 0,
	`parent_id` int,
	`target` varchar(50) DEFAULT '_self',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menus_id` PRIMARY KEY(`id`)
);
