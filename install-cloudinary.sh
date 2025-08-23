#!/bin/bash
# Script para instalar cloudinary manualmente
echo "📦 Instalando cloudinary SDK..."
npm install cloudinary@^2.0.0 --save 2>&1 | tail -5
echo ""
echo "✅ Verificando instalação:"
npm list cloudinary 2>&1 | head -5