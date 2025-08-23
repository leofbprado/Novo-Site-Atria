#!/bin/bash
echo "🚀 Deploy Firebase - Átria Veículos"
echo "=================================="

# Verificar se o build existe
if [ ! -d "dist" ]; then
    echo "❌ Pasta dist/ não encontrada. Execute: npm run build"
    exit 1
fi

echo "✅ Build encontrado ($(du -sh dist/ | cut -f1))"

# Verificar se Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "📦 Instalando Firebase CLI..."
    npm install -g firebase-tools
fi

echo "🔐 Configurando credenciais Firebase..."
export GOOGLE_APPLICATION_CREDENTIALS="/home/runner/workspace/novo-site-atria-2764e9169a7a.json"

echo "🚀 Iniciando deploy automático..."
firebase deploy --only hosting --project novo-site-atria --non-interactive

echo "✅ Deploy concluído!"
echo "🌐 Seu site está disponível em: https://novo-site-atria.web.app"