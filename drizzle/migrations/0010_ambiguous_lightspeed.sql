CREATE TABLE `incident_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incident_id` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`caption` varchar(255),
	`sort_order` int DEFAULT 0,
	`uploaded_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	CONSTRAINT `incident_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `incident_damages` MODIFY COLUMN `notes` text;--> statement-breakpoint
ALTER TABLE `incident_damages` ADD `area_heavy` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `incident_damages` ADD `area_medium` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `incident_damages` ADD `area_light` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `incident_photos` ADD CONSTRAINT `incident_photos_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incident_photos` ADD CONSTRAINT `incident_photos_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `photos_incident_idx` ON `incident_photos` (`incident_id`);