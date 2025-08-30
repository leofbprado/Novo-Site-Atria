#!/usr/bin/env bash
set -e
LATEST=$(git for-each-ref --sort=-creatordate --format='%(refname:short)' refs/tags | grep '^cp-' | head -n1 || true)
if [ -z "$LATEST" ]; then
  echo "❌ Nenhum checkpoint (cp-*) encontrado."; exit 1; fi

STAMP=$(date -u +%Y%m%d-%H%M%S)
# Guarda estado atual, por segurança
git stash push -u -m "pre-rollback-${STAMP}" || true

git reset --hard "$LATEST"
echo "✅ Rollback concluído para: ${LATEST}"
echo "Se precisar desfazer o rollback, use: git stash list / git stash pop"
