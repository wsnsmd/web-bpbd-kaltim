CREATE TABLE `gallery_albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`cover_url` varchar(500),
	`type` enum('photo','video','mixed') DEFAULT 'photo',
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `gallery_albums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `gallery_type_idx` ON `gallery_items`;--> statement-breakpoint
DROP INDEX `gallery_order_idx` ON `gallery_items`;--> statement-breakpoint
ALTER TABLE `gallery_items` ADD `album_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `gallery_albums` ADD CONSTRAINT `gallery_albums_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `gallery_albums_order_idx` ON `gallery_albums` (`order`);--> statement-breakpoint
CREATE INDEX `gallery_albums_type_idx` ON `gallery_albums` (`type`);--> statement-breakpoint
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_album_id_gallery_albums_id_fk` FOREIGN KEY (`album_id`) REFERENCES `gallery_albums`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `gallery_items_album_idx` ON `gallery_items` (`album_id`);--> statement-breakpoint
CREATE INDEX `gallery_items_order_idx` ON `gallery_items` (`order`);--> statement-breakpoint
CREATE INDEX `gallery_items_type_idx` ON `gallery_items` (`type`);