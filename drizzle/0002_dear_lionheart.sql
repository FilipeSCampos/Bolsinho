CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`name` varchar(200),
	`quantity` int NOT NULL DEFAULT 0,
	`averagePrice` int NOT NULL,
	`totalInvested` int NOT NULL DEFAULT 0,
	`currentValue` int NOT NULL DEFAULT 0,
	`currency` varchar(10) DEFAULT 'BRL',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`normalizedTicker` varchar(50),
	`name` varchar(200),
	`currentPrice` int,
	`previousClose` int,
	`change` int,
	`changePercent` int,
	`dayHigh` int,
	`dayLow` int,
	`volume` int,
	`currency` varchar(10) DEFAULT 'BRL',
	`market` varchar(50),
	`sector` varchar(100),
	`industry` varchar(200),
	`marketCap` varchar(50),
	`historyData` text,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `stockCache_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `investments` ADD CONSTRAINT `investments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;