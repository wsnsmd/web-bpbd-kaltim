CREATE TABLE `disaster_causes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean DEFAULT true,
	CONSTRAINT `disaster_causes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disaster_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` enum('alam','non_alam') NOT NULL DEFAULT 'alam',
	`icon` varchar(10) DEFAULT '⚠️',
	`color` varchar(7) DEFAULT '#6b7592',
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	CONSTRAINT `disaster_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_damages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incident_id` int NOT NULL,
	`asset_name` varchar(100) NOT NULL,
	`heavy_damage` int DEFAULT 0,
	`moderate_damage` int DEFAULT 0,
	`light_damage` int DEFAULT 0,
	`estimated_loss` decimal(15,2) DEFAULT '0',
	`notes` varchar(255),
	CONSTRAINT `incident_damages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_timelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incident_id` int NOT NULL,
	`logged_at` datetime NOT NULL DEFAULT NOW(),
	`event_type` enum('laporan_awal','verifikasi','pengerahan','penanganan','kondisi_update','korban_update','selesai','catatan') DEFAULT 'catatan',
	`title` varchar(255) NOT NULL,
	`description` text,
	`status_before` enum('aktif','ditangani','selesai'),
	`status_after` enum('aktif','ditangani','selesai'),
	`created_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	CONSTRAINT `incident_timelines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_victims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incident_id` int NOT NULL,
	`impact_type` enum('meninggal','hilang','luka_sakit','menderita','mengungsi') NOT NULL,
	`age_group` enum('anak','dewasa','lansia','tidak_diketahui') DEFAULT 'tidak_diketahui',
	`count_male` int DEFAULT 0,
	`count_female` int DEFAULT 0,
	`count_total` int DEFAULT 0,
	`notes` varchar(255),
	CONSTRAINT `incident_victims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`disaster_type_id` int,
	`cause_id` int,
	`cause_detail` varchar(255),
	`description` text,
	`source` varchar(255),
	`occurred_date` date NOT NULL,
	`occurred_time` time,
	`province_id` varchar(10) DEFAULT '64',
	`regency_id` varchar(10),
	`district_id` varchar(10),
	`village_name` varchar(100),
	`address_detail` varchar(500),
	`latitude` decimal(10,7) NOT NULL,
	`longitude` decimal(10,7) NOT NULL,
	`status` enum('aktif','ditangani','selesai') DEFAULT 'aktif',
	`current_condition` varchar(255),
	`current_effort` text,
	`is_published` boolean DEFAULT true,
	`reported_by` varchar(36),
	`created_at` datetime DEFAULT NOW(),
	`updated_at` datetime DEFAULT NOW(),
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`level` enum('provinsi','kabkota','kecamatan','kelurahan') NOT NULL,
	`parent_id` varchar(10),
	CONSTRAINT `regions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `incident_damages` ADD CONSTRAINT `incident_damages_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incident_timelines` ADD CONSTRAINT `incident_timelines_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incident_timelines` ADD CONSTRAINT `incident_timelines_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incident_victims` ADD CONSTRAINT `incident_victims_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_disaster_type_id_disaster_types_id_fk` FOREIGN KEY (`disaster_type_id`) REFERENCES `disaster_types`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_cause_id_disaster_causes_id_fk` FOREIGN KEY (`cause_id`) REFERENCES `disaster_causes`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_reported_by_users_id_fk` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `damages_incident_idx` ON `incident_damages` (`incident_id`);--> statement-breakpoint
CREATE INDEX `timelines_incident_idx` ON `incident_timelines` (`incident_id`);--> statement-breakpoint
CREATE INDEX `timelines_logged_idx` ON `incident_timelines` (`logged_at`);--> statement-breakpoint
CREATE INDEX `victims_incident_idx` ON `incident_victims` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incidents_type_idx` ON `incidents` (`disaster_type_id`);--> statement-breakpoint
CREATE INDEX `incidents_status_idx` ON `incidents` (`status`);--> statement-breakpoint
CREATE INDEX `incidents_regency_idx` ON `incidents` (`regency_id`);--> statement-breakpoint
CREATE INDEX `incidents_date_idx` ON `incidents` (`occurred_date`);--> statement-breakpoint
CREATE INDEX `regions_parent_idx` ON `regions` (`parent_id`);--> statement-breakpoint
CREATE INDEX `regions_level_idx` ON `regions` (`level`);