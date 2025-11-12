# Script PowerShell para alterar o autor de todos os commits
# Uso: .\scripts\fix-commits-author.ps1 -NewName "Seu Nome" -NewEmail "seu@email.com"

param(
    [string]$NewName = "Filipe Sampaio Campos",
    [string]$NewEmail = "113521439+FilipeSCampos@users.noreply.github.com"
)

Write-Host "Alterando autor de todos os commits para:" -ForegroundColor Cyan
Write-Host "  Nome: $NewName" -ForegroundColor Yellow
Write-Host "  Email: $NewEmail" -ForegroundColor Yellow
Write-Host ""

# Backup do repositório (importante!)
Write-Host "Criando backup do repositório..." -ForegroundColor Green
git tag backup-before-author-change

# Alterar a configuração do Git
Write-Host "Alterando configuração do Git..." -ForegroundColor Green
git config user.name "$NewName"
git config user.email "$NewEmail"

# Reescrever o histórico usando git filter-branch
Write-Host "Reescrevendo histórico do Git..." -ForegroundColor Green
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Yellow

$env:GIT_AUTHOR_NAME = $NewName
$env:GIT_AUTHOR_EMAIL = $NewEmail
$env:GIT_COMMITTER_NAME = $NewName
$env:GIT_COMMITTER_EMAIL = $NewEmail

git filter-branch --env-filter "
    export GIT_AUTHOR_NAME='$NewName'
    export GIT_AUTHOR_EMAIL='$NewEmail'
    export GIT_COMMITTER_NAME='$NewName'
    export GIT_COMMITTER_EMAIL='$NewEmail'
" --tag-name-filter cat -- --branches --tags

Write-Host ""
Write-Host "✅ Histórico reescrito com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Para verificar os commits:" -ForegroundColor Cyan
Write-Host "  git log --pretty=format:`"%h|%an|%ae|%s`" -10" -ForegroundColor White
Write-Host ""
Write-Host "Para fazer push (forçado):" -ForegroundColor Cyan
Write-Host "  git push --force --all" -ForegroundColor White
Write-Host "  git push --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Isso reescreve o histórico. Certifique-se de fazer backup antes de fazer push!" -ForegroundColor Red

