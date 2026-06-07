CREATE TABLE `analytics_daily_summary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`total_views` int DEFAULT 0,
	`unique_sessions` int DEFAULT 0,
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `analytics_daily_summary_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_daily_summary_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` varchar(500) NOT NULL,
	`title` varchar(500),
	`referrer` varchar(500),
	`user_agent` text,
	`browser` varchar(100),
	`os` varchar(100),
	`device` varchar(50),
	`ip` varchar(50),
	`country` varchar(100),
	`city` varchar(100),
	`session_id` varchar(100),
	`created_at` datetime NOT NULL DEFAULT NOW(),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `path_idx` ON `page_views` (`path`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `page_views` (`created_at`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `page_views` (`session_id`);