#!/usr/bin/env node

/**
 * Análise de Performance CSS - Átria Veículos
 * Identifica gargalos de CSS e gera relatório de otimização
 */

import fs from 'fs';
import path from 'path';

// Função para analisar tamanho de arquivos CSS
function analyzeCSSFiles() {
  const cssFiles = [];
  
  // Encontrar arquivos CSS
  const findCSS = (dir) => {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules')) {
          findCSS(fullPath);
        } else if (item.endsWith('.css')) {
          const size = stat.size;
          cssFiles.push({
            path: fullPath,
            name: item,
            size: size,
            sizeKB: Math.round(size / 1024),
            sizeMB: (size / (1024 * 1024)).toFixed(2)
          });
        }
      }
    } catch (error) {
      // Ignorar erros de diretório
    }
  };
  
  findCSS('./src');
  findCSS('./public'); 
  findCSS('./dist');
  
  return cssFiles.sort((a, b) => b.size - a.size);
}

// Função para analisar conteúdo CSS
function analyzeCSSContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Estatísticas básicas
    const stats = {
      lines: content.split('\n').length,
      characters: content.length,
      rules: (content.match(/\{[^}]*\}/g) || []).length,
      mediaQueries: (content.match(/@media[^{]*\{/g) || []).length,
      fontFaces: (content.match(/@font-face/g) || []).length,
      imports: (content.match(/@import/g) || []).length,
      keyframes: (content.match(/@keyframes/g) || []).length
    };
    
    // Detectar frameworks/bibliotecas
    const frameworks = [];
    if (content.includes('bootstrap')) frameworks.push('Bootstrap');
    if (content.includes('slick')) frameworks.push('Slick Carousel');  
    if (content.includes('wow.js')) frameworks.push('WOW.js');
    if (content.includes('photoswipe')) frameworks.push('PhotoSwipe');
    if (content.includes('boxcar')) frameworks.push('BoxCar Theme');
    
    return { stats, frameworks };
  } catch (error) {
    return { stats: {}, frameworks: [], error: error.message };
  }
}

// Função para verificar CSS crítico
function analyzeCriticalCSS() {
  const criticalSections = {
    'Hero/Banner': ['hero', 'banner', 'boxcar-banner'],
    'Header/Navigation': ['header', 'nav', 'navigation'],
    'Layout Base': ['container', 'row', 'col', 'boxcar-container'],
    'Typography': ['font', 'text', 'h1', 'h2', 'h3'],
    'Buttons': ['btn', 'button'],
    'Forms': ['form', 'input', 'select'],
    'Mobile': ['mobile', '@media', 'responsive']
  };
  
  const results = {};
  
  try {
    const indexCSS = fs.readFileSync('./src/index.css', 'utf8');
    
    for (const [section, keywords] of Object.entries(criticalSections)) {
      let found = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = indexCSS.match(regex);
        if (matches) found += matches.length;
      }
      results[section] = found;
    }
  } catch (error) {
    results.error = error.message;
  }
  
  return results;
}

// Função para gerar recomendações
function generateRecommendations(cssFiles, criticalAnalysis) {
  const recommendations = [];
  
  // Analisar tamanho total
  const totalSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  if (totalSize > 1024 * 1024) { // > 1MB
    recommendations.push({
      priority: 'ALTA',
      type: 'Tamanho',
      issue: `CSS total muito grande: ${totalMB}MB`,
      solution: 'Implementar critical CSS inline + lazy loading',
      impact: 'Redução de 70-80% no First Paint'
    });
  }
  
  // Verificar arquivos grandes
  const largeFiles = cssFiles.filter(f => f.size > 100 * 1024); // > 100KB
  for (const file of largeFiles) {
    recommendations.push({
      priority: 'ALTA',
      type: 'Arquivo Grande',
      issue: `${file.name}: ${file.sizeKB}KB`,
      solution: 'Dividir em crítico + não-crítico',
      impact: 'Melhoria significativa na renderização inicial'
    });
  }
  
  // Verificar CSS crítico
  if (criticalAnalysis['Hero/Banner'] < 5) {
    recommendations.push({
      priority: 'CRÍTICA',
      type: 'Critical CSS',
      issue: 'CSS do Hero/Banner não otimizado para inline',
      solution: 'Extrair CSS crítico do banner para <style> inline',
      impact: 'Eliminação de FOUC, renderização instantânea'
    });
  }
  
  return recommendations;
}

// Função principal
function main() {
  console.log('🔍 ANÁLISE DE PERFORMANCE CSS');
  console.log('=============================');
  console.log('📊 Identificando gargalos de CSS...\n');
  
  // Analisar arquivos CSS
  const cssFiles = analyzeCSSFiles();
  
  if (cssFiles.length === 0) {
    console.log('❌ Nenhum arquivo CSS encontrado!');
    return;
  }
  
  console.log('📁 ARQUIVOS CSS ENCONTRADOS:');
  console.log('============================');
  
  let totalSize = 0;
  for (const file of cssFiles.slice(0, 10)) { // Top 10
    totalSize += file.size;
    console.log(`📄 ${file.name}`);
    console.log(`   📂 ${file.path}`);
    console.log(`   📊 ${file.sizeKB}KB (${file.sizeMB}MB)`);
    
    // Analisar conteúdo dos arquivos grandes
    if (file.size > 50 * 1024) { // > 50KB
      const analysis = analyzeCSSContent(file.path);
      if (analysis.stats.rules) {
        console.log(`   🎯 ${analysis.stats.rules} regras CSS, ${analysis.stats.mediaQueries} media queries`);
      }
      if (analysis.frameworks.length > 0) {
        console.log(`   📚 Frameworks: ${analysis.frameworks.join(', ')}`);
      }
    }
    console.log('');
  }
  
  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`💾 TOTAL CSS: ${totalMB}MB (${Math.round(totalSize / 1024)}KB)`);
  console.log('');
  
  // Analisar CSS crítico
  console.log('🎯 ANÁLISE CSS CRÍTICO:');
  console.log('=======================');
  const criticalAnalysis = analyzeCriticalCSS();
  
  for (const [section, count] of Object.entries(criticalAnalysis)) {
    if (section !== 'error') {
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${section}: ${count} ocorrências`);
    }
  }
  console.log('');
  
  // Gerar recomendações
  const recommendations = generateRecommendations(cssFiles, criticalAnalysis);
  
  console.log('💡 RECOMENDAÇÕES DE OTIMIZAÇÃO:');
  console.log('===============================');
  
  if (recommendations.length === 0) {
    console.log('✅ CSS já está bem otimizado!');
  } else {
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      console.log(`${i + 1}. [${rec.priority}] ${rec.type}`);
      console.log(`   🔴 Problema: ${rec.issue}`);
      console.log(`   💡 Solução: ${rec.solution}`);
      console.log(`   🚀 Impacto: ${rec.impact}`);
      console.log('');
    }
  }
  
  // Próximos passos
  console.log('📋 PRÓXIMOS PASSOS SUGERIDOS:');
  console.log('=============================');
  console.log('1. Implementar Critical CSS Strategy');
  console.log('2. Dividir CSS em crítico/não-crítico');
  console.log('3. Lazy load de CSS não-crítico');
  console.log('4. Minificar e comprimir CSS');
  console.log('5. Remover CSS não utilizado');
  console.log('6. Implementar cache de longo prazo');
}

// Executar análise
main();