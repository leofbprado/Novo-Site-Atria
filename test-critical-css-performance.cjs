const fs = require('fs');

function testCriticalCSSPerformance() {
  console.log('🧪 Testando otimização de Critical CSS...');
  
  // Ler index.html
  const indexHTML = fs.readFileSync('./index.html', 'utf8');
  
  // Analisar Critical CSS inline
  const styleMatches = indexHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
  let totalCriticalCSS = 0;
  
  if (styleMatches) {
    styleMatches.forEach((style, index) => {
      const cssContent = style.replace(/<\/?style[^>]*>/g, '');
      const size = new Blob([cssContent]).size;
      totalCriticalCSS += size;
      console.log(`📊 Critical CSS Block ${index + 1}: ${(size/1024).toFixed(2)}KB`);
    });
  }
  
  console.log(`📏 Total Critical CSS inline: ${(totalCriticalCSS/1024).toFixed(2)}KB`);
  
  // Verificar CSS assíncrono
  const asyncCSSMatches = indexHTML.match(/rel="preload"[^>]*as="style"/g);
  console.log(`⚡ CSS assíncrono encontrado: ${asyncCSSMatches ? asyncCSSMatches.length : 0} arquivos`);
  
  // Verificar preloads de fontes
  const fontPreloads = indexHTML.match(/rel="preload"[^>]*as="font"/g);
  console.log(`🔤 Font preloads: ${fontPreloads ? fontPreloads.length : 0}`);
  
  // Verificar preconnects
  const preconnects = indexHTML.match(/rel="preconnect"/g);
  console.log(`🔗 Preconnects: ${preconnects ? preconnects.length : 0}`);
  
  // Análise de otimização
  console.log('\n🎯 Análise de Otimização:');
  
  if (totalCriticalCSS > 0 && totalCriticalCSS < 5120) { // < 5KB é bom
    console.log('✅ Critical CSS size OK (< 5KB)');
  } else if (totalCriticalCSS > 5120) {
    console.log('⚠️ Critical CSS pode ser muito grande (> 5KB)');
  }
  
  if (asyncCSSMatches && asyncCSSMatches.length > 0) {
    console.log('✅ CSS não-crítico carregado assincronamente');
  } else {
    console.log('❌ CSS não-crítico pode estar bloqueando o render');
  }
  
  if (fontPreloads && fontPreloads.length >= 2) {
    console.log('✅ Fontes críticas pré-carregadas');
  }
  
  // Gerar relatório de performance
  const report = {
    criticalCSSSize: Math.round(totalCriticalCSS),
    criticalCSSSizeKB: Math.round(totalCriticalCSS/1024*100)/100,
    asyncCSSFiles: asyncCSSMatches ? asyncCSSMatches.length : 0,
    fontPreloads: fontPreloads ? fontPreloads.length : 0,
    preconnects: preconnects ? preconnects.length : 0,
    timestamp: new Date().toISOString(),
    recommendations: []
  };
  
  // Recomendações
  if (totalCriticalCSS > 5120) {
    report.recommendations.push('Reduzir tamanho do Critical CSS inline');
  }
  if (!asyncCSSMatches || asyncCSSMatches.length === 0) {
    report.recommendations.push('Implementar carregamento assíncrono de CSS não-crítico');
  }
  if (!fontPreloads || fontPreloads.length < 2) {
    report.recommendations.push('Adicionar preload das fontes críticas');
  }
  
  fs.writeFileSync('./critical-css-performance-report.json', JSON.stringify(report, null, 2));
  console.log('\n📋 Relatório salvo em: critical-css-performance-report.json');
  
  return report;
}

if (require.main === module) {
  testCriticalCSSPerformance();
}

module.exports = { testCriticalCSSPerformance };