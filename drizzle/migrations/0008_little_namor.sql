ALTER TABLE `incidents` ADD `village_id` varchar(10);--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_village_id_regions_id_fk` FOREIGN KEY (`village_id`) REFERENCES `regions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `incidents_village_idx` ON `incidents` (`village_id`);