CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`description` varchar(255),
	`icon` varchar(100) NOT NULL DEFAULT 'Circle',
	`href` varchar(500) NOT NULL,
	`color` varchar(30) DEFAULT 'gold',
	`order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `services_order_idx` ON `services` (`order`);