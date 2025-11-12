-- Script SQL para limpar o cache de ações
-- Execute: mysql -u bolsinho -p bolsinho < scripts/clear-stock-cache.sql
-- Ou via Docker: docker exec -i mysql-container mysql -u bolsinho -p bolsinho < scripts/clear-stock-cache.sql

DELETE FROM stockCache;

-- Verifica se foi limpo
SELECT COUNT(*) as total_cached FROM stockCache;

