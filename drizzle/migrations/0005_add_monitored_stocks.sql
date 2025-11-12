-- Migration: Add monitored stocks table
-- Description: Create table to store user's monitored stocks (up to 6 per user)
-- Date: 2025-11-12

CREATE TABLE IF NOT EXISTS `monitoredStocks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `ticker` VARCHAR(20) NOT NULL,
  `displayOrder` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_ticker` (`userId`, `ticker`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_displayOrder` (`displayOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

