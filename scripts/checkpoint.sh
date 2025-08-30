#!/usr/bin/env bash
set -e
MSG="${1:-checkpoint manual}"
STAMP=$(date -u +%Y%m%d-%H%M%S)
TAG="cp-$STAMP"

# Garante repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repo."; exit 1; }

# Adiciona e comita mudanças (se houver)
git add -A
if git diff --cached --quiet; then
  echo "Sem mudanças a comitar. Criando tag mesmo assim: $TAG"
else
  git commit -m "checkpoint: ${MSG} (${STAMP})"
fi

# Cria tag (única)
if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null; then
  TAG="${TAG}a"
fi
git tag -a "$TAG" -m "checkpoint ${STAMP}"

# Snapshot opcional (tar.gz) para belt & suspenders
tar --exclude='./node_modules' --exclude='./dist' --exclude='./.git' -czf ".replit-checkpoints/${TAG}.tar.gz" .

# Log
echo "$(date -u +%F\ %T)Z | ${TAG} | ${MSG}" >> .replit-checkpoints/history.log
echo "✅ Checkpoint criado: ${TAG}"
