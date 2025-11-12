# Script para abrir a porta 3000 no Firewall do Windows
# Execute como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurar Firewall - Porta 3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "Clique com botão direito no PowerShell e selecione 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Verificando se a regra já existe..." -ForegroundColor Yellow

# Verifica se a regra já existe
$existingRule = Get-NetFirewallRule -DisplayName "FinBot Port 3000" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Regra já existe. Removendo regra antiga..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "FinBot Port 3000" -ErrorAction SilentlyContinue
}

Write-Host "Criando nova regra de firewall..." -ForegroundColor Yellow

try {
    # Cria a regra de entrada (Inbound)
    New-NetFirewallRule -DisplayName "FinBot Port 3000" `
        -Direction Inbound `
        -LocalPort 3000 `
        -Protocol TCP `
        -Action Allow `
        -Description "Permite acesso ao servidor FinBot na porta 3000" `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "SUCESSO! Porta 3000 aberta no firewall." -ForegroundColor Green
    Write-Host ""
    
    # Mostra o IP local
    Write-Host "Seu IP local na rede:" -ForegroundColor Cyan
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*" -and
        $_.IPAddress -notlike "172.25.*" -and
        $_.IPAddress -notlike "26.*"
    } | Select-Object -ExpandProperty IPAddress
    
    if ($ipAddresses) {
        foreach ($ip in $ipAddresses) {
            Write-Host "  - http://$ip:3000" -ForegroundColor Green
        }
    } else {
        Write-Host "  (Execute 'ipconfig' para ver seu IP)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Outros dispositivos na mesma rede podem acessar usando:" -ForegroundColor Cyan
    Write-Host "  http://SEU_IP_LOCAL:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para descobrir seu IP local, execute: ipconfig" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERRO ao criar regra de firewall:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

