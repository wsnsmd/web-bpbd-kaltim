CREATE TABLE `pages` (
	`id` varchar(36) NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(600) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`featured_image` varchar(500),
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`template` varchar(100) DEFAULT 'default',
	`author_id` varchar(36),
	`show_in_nav` boolean DEFAULT false,
	`nav_order` varchar(10) DEFAULT '0',
	`parent_id` varchar(36),
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`published_at` datetime,
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `pages` ADD CONSTRAINT `pages_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pages_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE INDEX `pages_author_idx` ON `pages` (`author_id`);