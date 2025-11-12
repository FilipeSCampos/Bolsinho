# Script para iniciar ngrok e expor o servidor local para a internet
# Requer ngrok instalado: https://ngrok.com/download

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciar Túnel ngrok - Porta 3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se ngrok está no diretório atual
$ngrokPath = ".\ngrok.exe"
if (-not (Test-Path $ngrokPath)) {
    Write-Host "ERRO: ngrok.exe não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para usar este script:" -ForegroundColor Yellow
    Write-Host "1. Baixe ngrok em: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "2. Extraia ngrok.exe para a pasta do projeto" -ForegroundColor Yellow
    Write-Host "3. Crie uma conta em: https://dashboard.ngrok.com/signup" -ForegroundColor Yellow
    Write-Host "4. Configure o authtoken: .\ngrok.exe config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Verifica se o servidor está rodando
Write-Host "Verificando se o servidor está rodando na porta 3000..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if (-not $connection) {
    Write-Host "AVISO: Nenhum servidor detectado na porta 3000!" -ForegroundColor Yellow
    Write-Host "Certifique-se de que o servidor está rodando antes de iniciar o túnel." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Deseja continuar mesmo assim? (S/N)"
    if ($response -ne "S" -and $response -ne "s") {
        exit 0
    }
}

Write-Host ""
Write-Host "Iniciando túnel ngrok..." -ForegroundColor Green
Write-Host "URL pública será exibida abaixo." -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o túnel." -ForegroundColor Yellow
Write-Host ""

# Inicia o ngrok
& $ngrokPath http 3000

