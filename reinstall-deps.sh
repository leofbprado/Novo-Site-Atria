#!/bin/bash

# Script para reinstalar dependências corrompidas

echo "🔧 Reinstalando dependências do projeto..."

# Limpar caches
rm -rf node_modules/.vite
rm -rf .swc

# Reinstalar dependências
npm install

echo "✅ Dependências reinstaladas!"