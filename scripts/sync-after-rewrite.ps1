# Script para sincronizar repositorio apos reescrever historico
# Este script faz force push de forma segura

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Sincronizar Repositorio Apos Reescrever Historico      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos em um repositorio Git
if (-not (Test-Path .git)) {
    Write-Host "[ERRO] Nao e um repositorio Git!" -ForegroundColor Red
    exit 1
}

# Verificar estado
Write-Host "[INFO] Verificando estado do repositorio..." -ForegroundColor Yellow
git status
Write-Host ""

# Verificar commits
Write-Host "[INFO] Verificando commits (ultimos 5):" -ForegroundColor Yellow
git log --pretty=format:"%h|%an|%ae|%s" -5
Write-Host ""

# Confirmar antes de continuar
Write-Host "[ATENCAO] Voce esta prestes a fazer FORCE PUSH!" -ForegroundColor Red
Write-Host "   Isso reescrevera o historico no servidor permanentemente." -ForegroundColor Red
Write-Host "   Certifique-se de que ninguem mais esta trabalhando no repositorio!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Deseja continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operacao cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Opcao 1: Force push com lease (mais seguro)
Write-Host "[OPCAO 1] Force push com lease (recomendado - mais seguro)..." -ForegroundColor Green
Write-Host "   Isso verifica se alguem fez push enquanto voce estava trabalhando." -ForegroundColor Gray
Write-Host ""
$useLease = Read-Host "Usar force-with-lease? (S/N - padrao: S)"
if ($useLease -eq "" -or $useLease -eq "S" -or $useLease -eq "s") {
    Write-Host ""
    Write-Host "[PASSO 1] Fazendo force push com lease..." -ForegroundColor Green
    git push --force-with-lease origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Push realizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] Falha no push com lease" -ForegroundColor Red
        Write-Host "   Tentando push forçado simples..." -ForegroundColor Yellow
        git push --force origin main
    }
} else {
    Write-Host ""
    Write-Host "[PASSO 1] Fazendo force push simples..." -ForegroundColor Green
    git push --force origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Push realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   [ERRO] Falha no push" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Possiveis causas:" -ForegroundColor Yellow
    Write-Host "   - Problemas de autenticacao" -ForegroundColor White
    Write-Host "   - Repositorio remoto nao encontrado" -ForegroundColor White
    Write-Host "   - Permissoes insuficientes" -ForegroundColor White
    exit 1
}

Write-Host ""

# Push das tags
Write-Host "[PASSO 2] Fazendo push das tags..." -ForegroundColor Green
git push --force origin --tags

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Tags enviadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Nao foi possivel enviar as tags (pode nao haver tags)" -ForegroundColor Yellow
}

Write-Host ""

# Verificar resultado
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   [OK] Sincronizacao concluida com sucesso!                " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verifique no GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/FilipeSCampos/Bolsinho" -ForegroundColor Cyan
Write-Host ""
Write-Host "Todos os commits devem mostrar seu nome como autor." -ForegroundColor White
Write-Host ""

