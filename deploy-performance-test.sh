#!/bin/bash

echo "🚀 DEPLOY PARA TESTE DE PERFORMANCE - LCP < 2.5s"
echo "================================================"
echo ""

# Build otimizado
echo "📦 Iniciando build otimizado..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Erro no build, abortando deploy"
  exit 1
fi

echo "✅ Build concluído com sucesso"
echo ""

# Deploy para Firebase
echo "🔥 Fazendo deploy para Firebase..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
  echo "❌ Erro no deploy, verificar configuração Firebase"
  exit 1
fi

echo "✅ Deploy realizado com sucesso!"
echo ""

echo "🎯 OTIMIZAÇÕES IMPLEMENTADAS:"
echo "=============================="
echo "🔸 CSS crítico inline (2.1 KB)"
echo "🔸 Hero banner simplificado (só imagem WebP - 76 KB)"
echo "🔸 Preload de fontes críticas (DM Sans + FontAwesome)"
echo "🔸 Font-display: swap para renderização instantânea"
echo "🔸 CSS não-crítico carregado de forma assíncrona"
echo "🔸 Preconnect para CDNs críticos"
echo ""

echo "📊 TESTE DE PERFORMANCE:"
echo "========================"
echo "🌐 URL: https://novo-site-atria.web.app/"
echo "🎯 Meta: LCP < 2.5 segundos"
echo "📱 Testar em dispositivos móveis e desktop"
echo ""

echo "🧪 FERRAMENTAS RECOMENDADAS:"
echo "============================="
echo "• PageSpeed Insights: https://pagespeed.web.dev/"
echo "• GTmetrix: https://gtmetrix.com/"
echo "• WebPageTest: https://webpagetest.org/"
echo "• Chrome DevTools > Lighthouse"
echo ""

echo "✅ DEPLOY FINALIZADO - PRONTO PARA TESTES!"