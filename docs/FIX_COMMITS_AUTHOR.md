# 🔧 Corrigir Autor dos Commits

Este guia explica como alterar o autor de todos os commits no repositório.

## 🎯 Objetivo

Alterar todos os commits que foram feitos com o autor "Manus Sandbox" para seu nome e email.

## ⚠️ Importante

**ATENÇÃO:** Reescrever o histórico do Git é uma operação destrutiva. Certifique-se de:
1. Fazer backup do repositório
2. Não fazer push se outras pessoas estão trabalhando no repositório
3. Se já fez push, será necessário fazer force push (isso pode afetar outros desenvolvedores)

## 🔧 Método 1: Usando o Script (Recomendado)

### Windows (PowerShell)

1. **Execute o script:**
   ```powershell
   .\scripts\fix-commits-author.ps1
   ```

2. **Ou com parâmetros customizados:**
   ```powershell
   .\scripts\fix-commits-author.ps1 -NewName "Seu Nome" -NewEmail "seu@email.com"
   ```

### Linux/macOS (Bash)

1. **Dê permissão de execução:**
   ```bash
   chmod +x scripts/fix-commits-author.sh
   ```

2. **Execute o script:**
   ```bash
   ./scripts/fix-commits-author.sh
   ```

3. **Ou com parâmetros customizados:**
   ```bash
   ./scripts/fix-commits-author.sh "Seu Nome" "seu@email.com"
   ```

## 🔧 Método 2: Manual

### Passo 1: Configurar o Git

```bash
git config user.name "Filipe Sampaio Campos"
git config user.email "113521439+FilipeSCampos@users.noreply.github.com"
```

### Passo 2: Fazer Backup

```bash
git tag backup-before-author-change
```

### Passo 3: Reescrever o Histórico

```bash
git filter-branch --env-filter '
    export GIT_AUTHOR_NAME="Filipe Sampaio Campos"
    export GIT_AUTHOR_EMAIL="113521439+FilipeSCampos@users.noreply.github.com"
    export GIT_COMMITTER_NAME="Filipe Sampaio Campos"
    export GIT_COMMITTER_EMAIL="113521439+FilipeSCampos@users.noreply.github.com"
' --tag-name-filter cat -- --branches --tags
```

### Passo 4: Limpar Referências Antigas

```bash
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
```

### Passo 5: Limpar Cache do Git

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## ✅ Verificar

Após executar o script, verifique os commits:

```bash
git log --pretty=format:"%h|%an|%ae|%s" -10
```

Todos os commits devem mostrar seu nome e email.

## 🚀 Fazer Push

**IMPORTANTE:** Se você já fez push do repositório, será necessário fazer force push:

```bash
git push --force --all
git push --force --tags
```

⚠️ **ATENÇÃO:** Force push reescreve o histórico no servidor. Certifique-se de que ninguém mais está trabalhando no repositório ou avise a equipe antes de fazer isso.

## 🔄 Reverter (Se Necessário)

Se algo der errado, você pode reverter usando o backup:

```bash
git reset --hard backup-before-author-change
```

## 📝 Notas

- O processo pode levar alguns minutos dependendo do tamanho do repositório
- Todos os commits serão reescritos com o novo autor
- As datas dos commits serão preservadas
- Os hashes dos commits mudarão (por isso é necessário force push)

## 🔗 Links Relacionados

- [Git Filter-Branch Documentation](https://git-scm.com/docs/git-filter-branch)
- [Rewriting History in Git](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

