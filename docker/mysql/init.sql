-- =====================================================
-- Script de Inicialização do Banco de Dados Bolsinho
-- Este script é executado automaticamente quando o
-- container MySQL é criado pela primeira vez
-- =====================================================

-- Usar o banco de dados (já criado pelo MYSQL_DATABASE)
USE bolsinho;

-- =====================================================
-- TABELA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NULL UNIQUE,
  `name` TEXT NULL,
  `email` VARCHAR(320) NULL UNIQUE,
  `passwordHash` VARCHAR(255) NULL,
  `loginMethod` VARCHAR(64) NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_openId` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('expense', 'income') NOT NULL DEFAULT 'expense',
  `icon` VARCHAR(50) NULL,
  `color` VARCHAR(20) NULL,
  `userId` INT NULL,
  `isDefault` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `categoryId` INT NULL,
  `amount` INT NOT NULL COMMENT 'Valor em centavos',
  `description` TEXT NOT NULL,
  `type` ENUM('expense', 'income') NOT NULL,
  `date` TIMESTAMP NOT NULL,
  `documentUrl` VARCHAR(500) NULL,
  `documentType` ENUM('recibo', 'nota_fiscal', 'extrato', 'boleto') NULL,
  `extractedData` TEXT NULL,
  `notes` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_categoryId` (`categoryId`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: budgets
-- =====================================================
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `categoryId` INT NULL,
  `amount` INT NOT NULL COMMENT 'Valor em centavos',
  `period` ENUM('monthly', 'weekly', 'yearly') NOT NULL DEFAULT 'monthly',
  `startDate` TIMESTAMP NOT NULL,
  `endDate` TIMESTAMP NULL,
  `alertThreshold` INT DEFAULT 80,
  `isActive` INT NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: goals
-- =====================================================
CREATE TABLE IF NOT EXISTS `goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `targetAmount` INT NOT NULL COMMENT 'Valor em centavos',
  `currentAmount` INT NOT NULL DEFAULT 0 COMMENT 'Valor em centavos',
  `deadline` TIMESTAMP NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: chatMessages
-- =====================================================
CREATE TABLE IF NOT EXISTS `chatMessages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `role` ENUM('user', 'assistant', 'system') NOT NULL,
  `content` TEXT NOT NULL,
  `imageUrl` VARCHAR(500) NULL,
  `metadata` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: alerts
-- =====================================================
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `type` ENUM('budget_exceeded', 'goal_milestone', 'unusual_spending', 'bill_reminder') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `severity` ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  `isRead` INT NOT NULL DEFAULT 0,
  `relatedEntityId` INT NULL,
  `relatedEntityType` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_isRead` (`isRead`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: documents
-- =====================================================
CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `transactionId` INT NULL,
  `fileUrl` VARCHAR(500) NOT NULL,
  `fileKey` VARCHAR(500) NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `fileType` VARCHAR(50) NOT NULL,
  `fileSize` INT NOT NULL,
  `documentType` ENUM('recibo', 'nota_fiscal', 'extrato', 'boleto', 'outro') NOT NULL,
  `ocrText` TEXT NULL,
  `extractedData` TEXT NULL,
  `processingStatus` ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `errorMessage` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL,
  INDEX `idx_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: investments
-- =====================================================
CREATE TABLE IF NOT EXISTS `investments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `ticker` VARCHAR(20) NOT NULL,
  `name` VARCHAR(200) NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `averagePrice` INT NOT NULL COMMENT 'Preço médio em centavos',
  `totalInvested` INT NOT NULL DEFAULT 0 COMMENT 'Total investido em centavos',
  `currentValue` INT DEFAULT 0 COMMENT 'Valor atual em centavos',
  `currency` VARCHAR(10) DEFAULT 'BRL',
  `notes` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_ticker` (`ticker`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: stockCache
-- =====================================================
CREATE TABLE IF NOT EXISTS `stockCache` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticker` VARCHAR(20) NOT NULL UNIQUE,
  `normalizedTicker` VARCHAR(50) NULL,
  `name` VARCHAR(200) NULL,
  `currentPrice` INT NULL COMMENT 'Preço em centavos',
  `previousClose` INT NULL COMMENT 'Preço anterior em centavos',
  `change` INT NULL COMMENT 'Variação em centavos',
  `changePercent` INT NULL COMMENT 'Variação percentual (ex: 250 = 2.50%)',
  `dayHigh` INT NULL COMMENT 'Máxima do dia em centavos',
  `dayLow` INT NULL COMMENT 'Mínima do dia em centavos',
  `volume` INT NULL COMMENT 'Volume de negociação',
  `currency` VARCHAR(10) DEFAULT 'BRL',
  `market` VARCHAR(50) NULL,
  `sector` VARCHAR(100) NULL,
  `industry` VARCHAR(200) NULL,
  `marketCap` VARCHAR(50) NULL COMMENT 'Market cap (string para valores grandes)',
  `historyData` TEXT NULL COMMENT 'JSON com histórico de preços',
  `lastUpdated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ticker` (`ticker`),
  INDEX `idx_lastUpdated` (`lastUpdated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: monitoredStocks
-- =====================================================
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

-- =====================================================
-- CONFIRMAÇÃO
-- =====================================================
SELECT 'Banco de dados bolsinho inicializado com sucesso!' AS Status;
SELECT 'Tabelas criadas:' AS Info;
SHOW TABLES;

