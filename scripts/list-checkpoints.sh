#!/usr/bin/env bash
set -e
echo "📌 Checkpoints (mais recentes primeiro):"
git tag --list 'cp-*' --sort=-creatordate | nl -w2 -s'. '
