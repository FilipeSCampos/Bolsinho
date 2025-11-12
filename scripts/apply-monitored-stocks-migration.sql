-- Script para aplicar migração da tabela monitoredStocks
-- Execute este script manualmente se a tabela não existir

USE bolsinho;

-- Verificar se a tabela já existe
-- Se não existir, criar a tabela
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

SELECT 'Tabela monitoredStocks criada ou ja existe!' AS Status;

