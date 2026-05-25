CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spot_id` integer NOT NULL,
	`token` text NOT NULL,
	`entry_time` text NOT NULL,
	`exit_time` text,
	FOREIGN KEY (`spot_id`) REFERENCES `parking_spots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_token_unique` ON `entries` (`token`);--> statement-breakpoint
CREATE TABLE `parking_spots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` integer NOT NULL,
	`status` text DEFAULT 'disponivel' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parking_spots_code_unique` ON `parking_spots` (`code`);