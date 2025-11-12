# Script de diagnóstico para problemas com ngrok

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnóstico ngrok" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se ngrok está rodando
Write-Host "1. Verificando processo ngrok..." -ForegroundColor Yellow
$ngrok = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrok) {
    Write-Host "   ✅ ngrok está rodando (PID: $($ngrok.Id))" -ForegroundColor Green
    Write-Host "      Iniciado em: $($ngrok.StartTime)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ ngrok NÃO está rodando" -ForegroundColor Red
    Write-Host "      Execute: .\ngrok.exe http 3000" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verificar se servidor está na porta 3000
Write-Host "2. Verificando servidor na porta 3000..." -ForegroundColor Yellow
$server = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($server) {
    Write-Host "   ✅ Servidor está rodando na porta 3000" -ForegroundColor Green
    $process = Get-Process -Id $server.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "      Processo: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Nenhum servidor na porta 3000" -ForegroundColor Red
    Write-Host "      Execute: pnpm dev" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar configuração do ngrok
Write-Host "3. Verificando configuração do ngrok..." -ForegroundColor Yellow
$ngrokConfig = "$env:USERPROFILE\.ngrok2\ngrok.yml"
if (Test-Path $ngrokConfig) {
    Write-Host "   ✅ Arquivo de configuração encontrado" -ForegroundColor Green
    Write-Host "      Local: $ngrokConfig" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Arquivo de configuração não encontrado" -ForegroundColor Yellow
    Write-Host "      Execute: .\ngrok.exe config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
    Write-Host "      Obtenha o token em: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Cyan
}

Write-Host ""

# 4. Verificar se ngrok.exe existe
Write-Host "4. Verificando ngrok.exe..." -ForegroundColor Yellow
if (Test-Path ".\ngrok.exe") {
    Write-Host "   ✅ ngrok.exe encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ ngrok.exe NÃO encontrado" -ForegroundColor Red
    Write-Host "      Baixe em: https://ngrok.com/download" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verificar interface web
Write-Host "5. Interface web do ngrok:" -ForegroundColor Yellow
Write-Host "   http://localhost:4040" -ForegroundColor Cyan
Write-Host "   (Abra no navegador para ver status e URL)" -ForegroundColor Gray

Write-Host ""

# 6. Verificar firewall
Write-Host "6. Verificando firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "*3000*" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "   ✅ Regra de firewall encontrada para porta 3000" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Nenhuma regra de firewall específica encontrada" -ForegroundColor Yellow
    Write-Host "      Execute: .\scripts\abrir-porta-3000.ps1" -ForegroundColor Yellow
}

Write-Host ""

# 7. Testar conexão local
Write-Host "7. Testando conexão local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Servidor responde em http://localhost:3000" -ForegroundColor Green
    Write-Host "      Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Servidor NÃO responde em http://localhost:3000" -ForegroundColor Red
    Write-Host "      Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Recomendações:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ngrok) {
    Write-Host "1. Inicie o ngrok:" -ForegroundColor Yellow
    Write-Host "   .\ngrok.exe http 3000" -ForegroundColor White
    Write-Host ""
}

if (-not $server) {
    Write-Host "2. Inicie o servidor:" -ForegroundColor Yellow
    Write-Host "   pnpm dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "3. Verifique a interface web do ngrok:" -ForegroundColor Yellow
Write-Host "   http://localhost:4040" -ForegroundColor White
Write-Host "   (Lá você verá a URL pública correta)" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Se aparecer página de warning do ngrok:" -ForegroundColor Yellow
Write-Host "   - Clique em 'Visit Site' ou 'Continue'" -ForegroundColor White
Write-Host "   - Isso é normal na versão gratuita" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Limpe o cache DNS se necessário:" -ForegroundColor Yellow
Write-Host "   ipconfig /flushdns" -ForegroundColor White
Write-Host ""

