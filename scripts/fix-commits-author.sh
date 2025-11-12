#!/bin/bash

# Script para alterar o autor de todos os commits
# Uso: ./scripts/fix-commits-author.sh "Seu Nome" "seu@email.com"

NEW_NAME="${1:-Filipe Sampaio Campos}"
NEW_EMAIL="${2:-113521439+FilipeSCampos@users.noreply.github.com}"

echo "Alterando autor de todos os commits para:"
echo "  Nome: $NEW_NAME"
echo "  Email: $NEW_EMAIL"
echo ""

# Backup do repositório (importante!)
echo "Criando backup do repositório..."
git tag backup-before-author-change

# Alterar a configuração do Git
echo "Alterando configuração do Git..."
git config user.name "$NEW_NAME"
git config user.email "$NEW_EMAIL"

# Reescrever o histórico usando git filter-branch
echo "Reescrevendo histórico do Git..."
git filter-branch --env-filter "
    export GIT_AUTHOR_NAME='$NEW_NAME'
    export GIT_AUTHOR_EMAIL='$NEW_EMAIL'
    export GIT_COMMITTER_NAME='$NEW_NAME'
    export GIT_COMMITTER_EMAIL='$NEW_EMAIL'
" --tag-name-filter cat -- --branches --tags

echo ""
echo "✅ Histórico reescrito com sucesso!"
echo ""
echo "Para verificar os commits:"
echo "  git log --pretty=format:\"%h|%an|%ae|%s\" -10"
echo ""
echo "Para fazer push (forçado):"
echo "  git push --force --all"
echo "  git push --force --tags"
echo ""
echo "⚠️  ATENÇÃO: Isso reescreve o histórico. Certifique-se de fazer backup antes de fazer push!"

