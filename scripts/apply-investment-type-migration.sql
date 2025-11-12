-- Migração para adicionar campo 'type' na tabela 'investments'
-- Execute este script no banco de dados MySQL

ALTER TABLE `investments` 
ADD COLUMN `type` ENUM('stock','fii','cdb','tesouro_direto','fundo_imobiliario','outro') 
DEFAULT 'stock' 
NOT NULL 
AFTER `name`;

-- Atualiza os registros existentes para 'stock' (padrão)
UPDATE `investments` SET `type` = 'stock' WHERE `type` IS NULL OR `type` = '';

