# Script PowerShell para aplicar migração da tabela monitoredStocks
# Este script aplica a migração SQL diretamente no banco de dados

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    Write-Host "[ERRO] DATABASE_URL nao configurada" -ForegroundColor Red
    Write-Host "Configure a variavel de ambiente DATABASE_URL ou passe como parametro" -ForegroundColor Yellow
    exit 1
}

# Extrair informações da URL do banco
# Formato: mysql://usuario:senha@host:porta/banco
if ($DatabaseUrl -match 'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
} else {
    Write-Host "[ERRO] Formato de DATABASE_URL invalido" -ForegroundColor Red
    Write-Host "Formato esperado: mysql://usuario:senha@host:porta/banco" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[INFO] Aplicando migracao da tabela monitoredStocks..." -ForegroundColor Yellow
Write-Host "  Host: $host" -ForegroundColor White
Write-Host "  Porta: $port" -ForegroundColor White
Write-Host "  Banco: $database" -ForegroundColor White
Write-Host "  Usuario: $user`n" -ForegroundColor White

# Ler o arquivo SQL
$sqlFile = Join-Path $PSScriptRoot "apply-monitored-stocks-migration.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERRO] Arquivo SQL nao encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw

# Aplicar usando mysql CLI (se disponível)
$mysqlCmd = "mysql"
try {
    # Tentar encontrar mysql no PATH
    $mysqlPath = Get-Command $mysqlCmd -ErrorAction Stop
    Write-Host "[INFO] Usando MySQL CLI: $($mysqlPath.Path)" -ForegroundColor Green
    
    # Preparar comando
    $env:MYSQL_PWD = $password
    $command = "`"$sqlContent`" | mysql -h $host -P $port -u $user $database"
    
    Write-Host "[INFO] Aplicando migracao..." -ForegroundColor Yellow
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[OK] Migracao aplicada com sucesso!`n" -ForegroundColor Green
    } else {
        Write-Host "`n[ERRO] Erro ao aplicar migracao (codigo: $LASTEXITCODE)`n" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[AVISO] MySQL CLI nao encontrado. Aplicando via Node.js..." -ForegroundColor Yellow
    
    # Aplicar usando Node.js e mysql2
    $nodeScript = @"
const mysql = require('mysql2/promise');

async function applyMigration() {
    try {
        const connection = await mysql.createConnection('$DatabaseUrl');
        
        const sql = \`
CREATE TABLE IF NOT EXISTS \`monitoredStocks\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`userId\` INT NOT NULL,
  \`ticker\` VARCHAR(20) NOT NULL,
  \`displayOrder\` INT NOT NULL DEFAULT 0,
  \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  UNIQUE KEY \`unique_user_ticker\` (\`userId\`, \`ticker\`),
  INDEX \`idx_userId\` (\`userId\`),
  INDEX \`idx_displayOrder\` (\`displayOrder\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
\`;
        
        await connection.execute(sql);
        console.log('[OK] Tabela monitoredStocks criada ou ja existe!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('[ERRO]', error.message);
        process.exit(1);
    }
}

applyMigration();
"@
    
    $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
    $nodeScript | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        node $tempFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n[OK] Migracao aplicada com sucesso!`n" -ForegroundColor Green
        } else {
            Write-Host "`n[ERRO] Erro ao aplicar migracao`n" -ForegroundColor Red
            exit 1
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

