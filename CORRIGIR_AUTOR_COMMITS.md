# 🔧 Como Corrigir o Autor dos Commits

Este guia explica como alterar o autor de todos os commits de "Manus Sandbox" para seu nome.

## ⚠️ Importante

**ATENÇÃO:** Reescrever o histórico do Git é uma operação que **altera permanentemente** o histórico. 

**Se você já fez push do repositório:**
- Será necessário fazer **force push** após a correção
- Isso pode afetar outras pessoas que estão trabalhando no repositório
- Avise a equipe antes de fazer force push

## 🚀 Método Rápido (PowerShell)

### Opção 1: Usar o Script Automático

1. **Execute o script:**
   ```powershell
   .\scripts\fix-commits-author-simple.ps1
   ```

2. **Siga as instruções na tela**

### Opção 2: Manual (Passo a Passo)

1. **Configurar o Git:**
   ```powershell
   git config user.name "Filipe Sampaio Campos"
   git config user.email "113521439+FilipeSCampos@users.noreply.github.com"
   ```

2. **Criar backup:**
   ```powershell
   git tag backup-before-author-change
   ```

3. **Reescrever histórico:**
   ```powershell
   git filter-branch --env-filter "export GIT_AUTHOR_NAME='Filipe Sampaio Campos'; export GIT_AUTHOR_EMAIL='113521439+FilipeSCampos@users.noreply.github.com'; export GIT_COMMITTER_NAME='Filipe Sampaio Campos'; export GIT_COMMITTER_EMAIL='113521439+FilipeSCampos@users.noreply.github.com'" --tag-name-filter cat -- --branches --tags
   ```

4. **Limpar referências antigas:**
   ```powershell
   git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }
   ```

5. **Limpar cache:**
   ```powershell
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

## ✅ Verificar

Verifique se os commits foram alterados:

```powershell
git log --pretty=format:"%h|%an|%ae|%s" -10
```

Todos os commits devem mostrar "Filipe Sampaio Campos" como autor.

## 🚀 Fazer Push (Se Necessário)

**Se você já fez push do repositório**, será necessário fazer force push:

```powershell
git push --force --all
git push --force --tags
```

⚠️ **ATENÇÃO:** Force push reescreve o histórico no servidor. Certifique-se de que ninguém mais está trabalhando no repositório ou avise a equipe antes!

## 🔄 Reverter (Se Algo Der Errado)

Se algo der errado, você pode reverter usando o backup:

```powershell
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

