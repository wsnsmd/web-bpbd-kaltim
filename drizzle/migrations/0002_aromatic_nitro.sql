CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` enum('main_nav','instansi_bar','footer_quick','footer_instansi') NOT NULL,
	`label` varchar(100) NOT NULL,
	`url` varchar(500) NOT NULL,
	`icon` varchar(100),
	`target` varchar(10) DEFAULT '_self',
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`parent_id` int,
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `menu_location_idx` ON `menu_items` (`location`);--> statement-breakpoint
CREATE INDEX `menu_order_idx` ON `menu_items` (`order`);