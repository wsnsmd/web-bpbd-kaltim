CREATE TABLE `gallery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('photo','video') NOT NULL DEFAULT 'photo',
	`title` varchar(255) NOT NULL,
	`caption` text,
	`thumbnail_url` varchar(500),
	`video_url` varchar(500),
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`uploaded_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `gallery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `gallery_type_idx` ON `gallery_items` (`type`);--> statement-breakpoint
CREATE INDEX `gallery_order_idx` ON `gallery_items` (`order`);