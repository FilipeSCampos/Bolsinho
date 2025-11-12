
# Script PowerShell simplificado para alterar o autor de todos os commits
# Versao sem emojis para compatibilidade com PowerShell do Windows

param(
    [string]$NewName = "Filipe Sampaio Campos",
    [string]$NewEmail = "113521439+FilipeSCampos@users.noreply.github.com"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Correcao de Autor dos Commits                           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos em um repositorio Git
if (-not (Test-Path .git)) {
    Write-Host "[ERRO] Nao e um repositorio Git!" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Configuracao:" -ForegroundColor Yellow
Write-Host "   Nome:  $NewName" -ForegroundColor White
Write-Host "   Email: $NewEmail" -ForegroundColor White
Write-Host ""

# Confirmar antes de continuar
$confirm = Read-Host "Deseja continuar? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operacao cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Passo 1: Backup
Write-Host "[PASSO 1] Criando backup..." -ForegroundColor Green
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupTag = "backup-before-author-change-$timestamp"
git tag $backupTag
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Backup criado: $backupTag" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Nao foi possivel criar o backup" -ForegroundColor Yellow
}
Write-Host ""

# Passo 2: Configurar Git
Write-Host "[PASSO 2] Configurando Git..." -ForegroundColor Green
git config user.name "$NewName"
git config user.email "$NewEmail"
Write-Host "   [OK] Configuracao atualizada" -ForegroundColor Green
Write-Host ""

# Passo 3: Reescrever historico
Write-Host "[PASSO 3] Reescrevendo historico do Git..." -ForegroundColor Green
Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Yellow
Write-Host ""

# Encontrar Git Bash
$gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
if ($gitPath) {
    $gitDir = Split-Path (Split-Path $gitPath)
    $bashPath = Join-Path $gitDir "bin\bash.exe"
    
    if (Test-Path $bashPath) {
        Write-Host "   [INFO] Usando Git Bash: $bashPath" -ForegroundColor Gray
        
        # Criar script bash temporario
        $scriptPath = Join-Path $env:TEMP "git-filter-$timestamp.sh"
        $scriptContent = "#!/bin/bash`n" +
                        "git filter-branch -f --env-filter '`n" +
                        "export GIT_AUTHOR_NAME=`"$NewName`"`n" +
                        "export GIT_AUTHOR_EMAIL=`"$NewEmail`"`n" +
                        "export GIT_COMMITTER_NAME=`"$NewName`"`n" +
                        "export GIT_COMMITTER_EMAIL=`"$NewEmail`"`n" +
                        "' --tag-name-filter cat -- --branches --tags`n"
        
        # Salvar script com encoding UTF8 sem BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($scriptPath, $scriptContent, $utf8NoBom)
        
        # Executar com Git Bash
        & $bashPath $scriptPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Historico reescrito com sucesso!" -ForegroundColor Green
            Remove-Item $scriptPath -ErrorAction SilentlyContinue
        } else {
            Write-Host "   [ERRO] Erro ao reescrever historico" -ForegroundColor Red
            Write-Host ""
            Write-Host "   Execute manualmente no Git Bash:" -ForegroundColor Yellow
            Write-Host "   git filter-branch -f --env-filter 'export GIT_AUTHOR_NAME=`"$NewName`"; export GIT_AUTHOR_EMAIL=`"$NewEmail`"; export GIT_COMMITTER_NAME=`"$NewName`"; export GIT_COMMITTER_EMAIL=`"$NewEmail`"' --tag-name-filter cat -- --branches --tags" -ForegroundColor Cyan
            exit 1
        }
    } else {
        Write-Host "   [ERRO] Git Bash nao encontrado" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Execute manualmente no Git Bash:" -ForegroundColor Yellow
        Write-Host "   git filter-branch -f --env-filter 'export GIT_AUTHOR_NAME=`"$NewName`"; export GIT_AUTHOR_EMAIL=`"$NewEmail`"; export GIT_COMMITTER_NAME=`"$NewName`"; export GIT_COMMITTER_EMAIL=`"$NewEmail`"' --tag-name-filter cat -- --branches --tags" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "   [ERRO] Git nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Passo 4: Limpar referencias antigas
Write-Host "[PASSO 4] Limpando referencias antigas..." -ForegroundColor Green
$refs = git for-each-ref --format="%(refname)" refs/original/ 2>$null
if ($refs) {
    $refs | ForEach-Object {
        git update-ref -d $_
    }
    Write-Host "   [OK] Referencias antigas removidas" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Nenhuma referencia antiga encontrada" -ForegroundColor Gray
}
Write-Host ""

# Passo 5: Limpar cache
Write-Host "[PASSO 5] Limpando cache do Git..." -ForegroundColor Green
git reflog expire --expire=now --all 2>$null
git gc --prune=now --aggressive 2>$null
Write-Host "   [OK] Cache limpo" -ForegroundColor Green
Write-Host ""

# Verificar resultado
Write-Host "[VERIFICACAO] Verificando commits:" -ForegroundColor Cyan
Write-Host ""
git log --pretty=format:"%h|%an|%ae|%s" -10
Write-Host ""

Write-Host "============================================================" -ForegroundColor Green
Write-Host "   [OK] Processo concluido com sucesso!                    " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifique os commits acima para confirmar a alteracao" -ForegroundColor White
Write-Host "2. Se estiver satisfeito, faca push forcado:" -ForegroundColor White
Write-Host "   git push --force --all" -ForegroundColor Cyan
Write-Host "   git push --force --tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "[ATENCAO] Force push reescreve o historico no servidor." -ForegroundColor Red
Write-Host "   Certifique-se de que ninguem mais esta trabalhando no repositorio!" -ForegroundColor Red
Write-Host ""
Write-Host "[BACKUP] Backup salvo em: $backupTag" -ForegroundColor Yellow
Write-Host "   Para reverter: git reset --hard $backupTag" -ForegroundColor Yellow
Write-Host ""
