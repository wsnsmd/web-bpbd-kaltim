CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_type` varchar(20) DEFAULT 'PDF',
	`file_size` varchar(30),
	`icon` varchar(100) DEFAULT 'FileText',
	`color_scheme` enum('danger','caution','warning','safe','navy') DEFAULT 'navy',
	`download_count` int DEFAULT 0,
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`uploaded_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `downloads` ADD CONSTRAINT `downloads_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `downloads_category_idx` ON `downloads` (`category`);--> statement-breakpoint
CREATE INDEX `downloads_order_idx` ON `downloads` (`order`);