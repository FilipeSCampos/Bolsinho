# 🔧 Como Corrigir o Autor dos Commits

Este guia explica como alterar o autor de todos os commits de "Manus Sandbox" para seu nome.

## ⚠️ Importante

**ATENÇÃO:** Reescrever o histórico do Git é uma operação que **altera permanentemente** o histórico. 

**Se você já fez push do repositório:**
- Será necessário fazer **force push** após a correção
- Isso pode afetar outras pessoas que estão trabalhando no repositório
- Avise a equipe antes de fazer force push

## 🚀 Método 1: Script Automático (Recomendado)

### Windows (PowerShell)

1. **Execute o script:**
   ```powershell
   .\scripts\fix-commits-author-direct.ps1
   ```

2. **Siga as instruções na tela**
   - O script criará um backup automaticamente
   - Reescreverá o histórico do Git
   - Limpará referências antigas
   - Mostrará os commits alterados

### Linux/macOS (Bash)

1. **Dê permissão de execução:**
   ```bash
   chmod +x scripts/fix-commits-author.sh
   ```

2. **Execute o script:**
   ```bash
   ./scripts/fix-commits-author.sh
   ```

## 🔧 Método 2: Manual (Git Bash)

Se o script não funcionar, você pode fazer manualmente:

### Passo 1: Abrir Git Bash

1. Abra o Git Bash no diretório do projeto
2. Ou execute no PowerShell: `bash`

### Passo 2: Configurar o Git

```bash
git config user.name "Filipe Sampaio Campos"
git config user.email "113521439+FilipeSCampos@users.noreply.github.com"
```

### Passo 3: Criar Backup

```bash
git tag backup-before-author-change
```

### Passo 4: Reescrever Histórico

```bash
git filter-branch -f --env-filter '
export GIT_AUTHOR_NAME="Filipe Sampaio Campos"
export GIT_AUTHOR_EMAIL="113521439+FilipeSCampos@users.noreply.github.com"
export GIT_COMMITTER_NAME="Filipe Sampaio Campos"
export GIT_COMMITTER_EMAIL="113521439+FilipeSCampos@users.noreply.github.com"
' --tag-name-filter cat -- --branches --tags
```

### Passo 5: Limpar Referências Antigas

```bash
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
```

### Passo 6: Limpar Cache

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## ✅ Verificar

Após executar o script ou os comandos, verifique os commits:

```bash
git log --pretty=format:"%h|%an|%ae|%s" -10
```

Todos os commits devem mostrar "Filipe Sampaio Campos" como autor.

## 🚀 Fazer Push (Sincronizar)

**IMPORTANTE:** Após reescrever o histórico, você **DEVE** fazer force push:

### Opção 1: Force Push com Lease (Recomendado - Mais Seguro)

```powershell
git push --force-with-lease origin main
git push --force origin --tags
```

O `--force-with-lease` é mais seguro porque verifica se alguém fez push enquanto você estava trabalhando.

### Opção 2: Force Push Simples

```powershell
git push --force origin main
git push --force origin --tags
```

⚠️ **ATENÇÃO:** Force push reescreve o histórico no servidor permanentemente!

- Certifique-se de que **ninguém mais está trabalhando** no repositório
- Avise a equipe antes de fazer force push
- Se outras pessoas já fizeram pull, elas precisarão reconfigurar seus repositórios

### ⚠️ Se Você Encontrar Erros

Se você encontrar erros como:
- `! [rejected] main -> main (non-fast-forward)`
- `fatal: refusing to merge unrelated histories`

Isso é **normal** após reescrever o histórico. Veja o guia completo: [docs/FIX_SYNC_AFTER_REWRITE.md](docs/FIX_SYNC_AFTER_REWRITE.md)

## 🔄 Reverter (Se Algo Der Errado)

Se algo der errado, você pode reverter usando o backup:

```bash
git reset --hard backup-before-author-change
```

## 📝 Notas

- O processo pode levar alguns minutos dependendo do tamanho do repositório
- Todos os commits serão reescritos com o novo autor
- As datas dos commits serão preservadas
- Os hashes dos commits mudarão (por isso é necessário force push se já fez push)

## 🔗 Links Relacionados

- [Documentação Completa](docs/FIX_COMMITS_AUTHOR.md)
- [Git Filter-Branch Documentation](https://git-scm.com/docs/git-filter-branch)
