CREATE TABLE `whispr` (
	`id` varchar(50) NOT NULL,
	`delete_id` varchar(30) NOT NULL,
	`content` mediumtext NOT NULL,
	`views` int NOT NULL,
	`show_views` boolean NOT NULL,
	`unlimited_views` boolean NOT NULL,
	`expires_at` timestamp NOT NULL,
	`show_expires_at` boolean NOT NULL,
	`show_copy_button` boolean NOT NULL,
	`show_download_button` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (UTC_TIMESTAMP),
	CONSTRAINT `whispr_id` PRIMARY KEY(`id`),
	CONSTRAINT `whispr_delete_id_unique` UNIQUE(`delete_id`)
);
--> statement-breakpoint
CREATE INDEX `expires_at_index` ON `whispr` (`expires_at`);