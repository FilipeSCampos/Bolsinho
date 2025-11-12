# Script PowerShell simplificado para alterar o autor de todos os commits
# Este script faz a alteração de forma mais segura e com melhor feedback

param(
    [string]$NewName = "Filipe Sampaio Campos",
    [string]$NewEmail = "113521439+FilipeSCampos@users.noreply.github.com"
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Correção de Autor dos Commits                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos em um repositório Git
if (-not (Test-Path .git)) {
    Write-Host "❌ Erro: Não é um repositório Git!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuração:" -ForegroundColor Yellow
Write-Host "   Nome:  $NewName" -ForegroundColor White
Write-Host "   Email: $NewEmail" -ForegroundColor White
Write-Host ""

# Confirmar antes de continuar
$confirm = Read-Host "Deseja continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Passo 1: Backup
Write-Host "📦 Passo 1: Criando backup..." -ForegroundColor Green
$backupTag = "backup-before-author-change-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git tag $backupTag
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Backup criado: $backupTag" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Aviso: Não foi possível criar o backup" -ForegroundColor Yellow
}
Write-Host ""

# Passo 2: Configurar Git
Write-Host "⚙️  Passo 2: Configurando Git..." -ForegroundColor Green
git config user.name "$NewName"
git config user.email "$NewEmail"
Write-Host "   ✅ Configuração atualizada" -ForegroundColor Green
Write-Host ""

# Passo 3: Reescrever histórico
Write-Host "🔄 Passo 3: Reescrevendo histórico do Git..." -ForegroundColor Green
Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Yellow
Write-Host ""

$filterScript = @"
export GIT_AUTHOR_NAME='$NewName'
export GIT_AUTHOR_EMAIL='$NewEmail'
export GIT_COMMITTER_NAME='$NewName'
export GIT_COMMITTER_EMAIL='$NewEmail'
"@

# Salvar script temporário
$tempScript = Join-Path $env:TEMP "git-filter-env.sh"
$filterScript | Out-File -FilePath $tempScript -Encoding UTF8

# Executar git filter-branch
git filter-branch --env-filter "`$env:GIT_AUTHOR_NAME='$NewName'; `$env:GIT_AUTHOR_EMAIL='$NewEmail'; `$env:GIT_COMMITTER_NAME='$NewName'; `$env:GIT_COMMITTER_EMAIL='$NewEmail'" --tag-name-filter cat -- --branches --tags

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "   ✅ Histórico reescrito com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "   ❌ Erro ao reescrever histórico" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Passo 4: Limpar referências antigas
Write-Host "🧹 Passo 4: Limpando referências antigas..." -ForegroundColor Green
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object {
    git update-ref -d $_
}
Write-Host "   ✅ Referências antigas removidas" -ForegroundColor Green
Write-Host ""

# Passo 5: Limpar cache
Write-Host "🗑️  Passo 5: Limpando cache do Git..." -ForegroundColor Green
git reflog expire --expire=now --all
git gc --prune=now --aggressive
Write-Host "   ✅ Cache limpo" -ForegroundColor Green
Write-Host ""

# Verificar resultado
Write-Host "📊 Verificando commits:" -ForegroundColor Cyan
Write-Host ""
git log --pretty=format:"%h|%an|%ae|%s" -10
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Processo concluído com sucesso!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifique os commits acima para confirmar a alteração" -ForegroundColor White
Write-Host "2. Se estiver satisfeito, faça push forçado:" -ForegroundColor White
Write-Host "   git push --force --all" -ForegroundColor Cyan
Write-Host "   git push --force --tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ATENÇÃO: Force push reescreve o histórico no servidor." -ForegroundColor Red
Write-Host "   Certifique-se de que ninguém mais está trabalhando no repositório!" -ForegroundColor Red
Write-Host ""
Write-Host "💾 Backup salvo em: $backupTag" -ForegroundColor Yellow
Write-Host "   Para reverter: git reset --hard $backupTag" -ForegroundColor Yellow
Write-Host ""

