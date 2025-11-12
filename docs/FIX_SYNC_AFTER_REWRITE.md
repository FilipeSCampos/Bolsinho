# 🔄 Sincronizar Após Reescrever Histórico

Este guia explica como sincronizar o repositório após reescrever o histórico do Git (corrigir autor dos commits).

## ⚠️ Problema

Após reescrever o histórico do Git, você pode encontrar erros ao tentar fazer push:

```
! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs
```

Ou ao tentar fazer pull:

```
fatal: refusing to merge unrelated histories
```

## ✅ Solução: Force Push

Como o histórico foi reescrito, os hashes dos commits mudaram. O Git considera que são históricos diferentes. É necessário fazer **force push** para sobrescrever o histórico no servidor.

### ⚠️ IMPORTANTE

**Force push reescreve o histórico no servidor permanentemente!**

- Certifique-se de que **ninguém mais está trabalhando** no repositório
- Avise a equipe antes de fazer force push
- Se outras pessoas já fizeram pull, elas precisarão reconfigurar seus repositórios locais

## 🚀 Passo a Passo

### 1. Verificar o Estado Atual

```powershell
git status
git log --oneline -5
```

### 2. Verificar se os Commits Foram Alterados

```powershell
git log --pretty=format:"%h|%an|%ae|%s" -10
```

Todos os commits devem mostrar seu nome (Filipe Sampaio Campos) como autor.

### 3. Fazer Force Push

**Opção 1: Force Push Simples (Recomendado)**

```powershell
git push --force origin main
```

**Opção 2: Force Push com Lease (Mais Seguro)**

```powershell
git push --force-with-lease origin main
```

O `--force-with-lease` é mais seguro porque:
- Verifica se alguém fez push enquanto você estava trabalhando
- Falha se o remoto foi atualizado por outra pessoa
- Evita sobrescrever trabalho de outras pessoas

### 4. Fazer Push das Tags (Se Houver)

Se você criou tags de backup, também precisa fazer push delas:

```powershell
git push --force origin --tags
```

## 🔄 Se Outras Pessoas Estão Trabalhando

Se outras pessoas já fizeram pull do repositório, elas precisarão:

### Opção 1: Reconfigurar o Repositório Local

```bash
# Fazer backup do trabalho local
git branch backup-local

# Buscar o histórico reescrito
git fetch origin

# Resetar para o histórico remoto
git reset --hard origin/main
```

### Opção 2: Re-clonar o Repositório

```bash
# Fazer backup do trabalho local
cd ..
cp -r finbot-source finbot-source-backup

# Re-clonar
rm -rf finbot-source
git clone https://github.com/FilipeSCampos/Bolsinho.git finbot-source
```

## 📝 Comandos Completos

### Windows (PowerShell)

```powershell
# 1. Verificar estado
git status
git log --oneline -5

# 2. Verificar se commits foram alterados
git log --pretty=format:"%h|%an|%ae|%s" -10

# 3. Force push (escolha uma opção)
git push --force-with-lease origin main
# OU
git push --force origin main

# 4. Push das tags (se houver)
git push --force origin --tags
```

### Linux/macOS (Bash)

```bash
# 1. Verificar estado
git status
git log --oneline -5

# 2. Verificar se commits foram alterados
git log --pretty=format:"%h|%an|%ae|%s" -10

# 3. Force push (escolha uma opção)
git push --force-with-lease origin main
# OU
git push --force origin main

# 4. Push das tags (se houver)
git push --force origin --tags
```

## 🔍 Verificar Após o Push

Após fazer o push, verifique no GitHub:

1. Acesse: https://github.com/FilipeSCampos/Bolsinho
2. Vá em "Commits"
3. Verifique se todos os commits mostram seu nome como autor

## ⚠️ Problemas Comuns

### Erro: "Updates were rejected"

**Causa:** O histórico local e remoto divergiram.

**Solução:** Use force push:
```powershell
git push --force-with-lease origin main
```

### Erro: "refusing to merge unrelated histories"

**Causa:** O Git não consegue fazer merge porque os históricos são diferentes.

**Solução:** Não faça pull, faça force push diretamente:
```powershell
git push --force-with-lease origin main
```

### Erro: "remote contains work that you do not have"

**Causa:** Alguém fez push enquanto você estava reescrevendo o histórico.

**Solução:**
1. Verifique se há trabalho importante no remoto
2. Se não houver, use `--force` (sem `--force-with-lease`)
3. Se houver, você precisará integrar o trabalho primeiro

## 🔗 Links Relacionados

- [Corrigir Autor dos Commits](CORRIGIR_AUTOR_COMMITS.md)
- [Documentação Completa](docs/FIX_COMMITS_AUTHOR.md)
- [Git Push Documentation](https://git-scm.com/docs/git-push)

