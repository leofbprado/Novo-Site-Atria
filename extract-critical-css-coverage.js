#!/usr/bin/env node

/**
 * Script para extrair CSS crítico baseado no Coverage do Chrome
 * 
 * INSTRUÇÕES DE USO:
 * 
 * 1. Abra o site no Chrome
 * 2. Abra DevTools (F12) e pressione Ctrl+Shift+P
 * 3. Digite "Coverage" e abra o painel
 * 4. Clique em "Start instrumenting coverage and reload page"
 * 5. Após reload, clique no CSS principal
 * 6. Copie as regras usadas (em azul) para critical-coverage.css
 * 7. Execute este script para otimizar
 */

import fs from 'fs';
import path from 'path';

console.log('🎯 Extração de CSS Crítico baseado em Coverage do Chrome');
console.log('=========================================================\n');

// Elementos críticos acima da dobra (above the fold)
const CRITICAL_ELEMENTS = {
  // Hero/Banner
  banner: [
    '.boxcar-banner-section-v1',
    '.banner-content',
    '.banner-title',
    '.video-background',
    '.banner-image',
    '.hero-section',
    '.breadcrumb'
  ],
  
  // Navegação/Header
  navigation: [
    '.boxcar-header',
    '.header-upper',
    '.header-lower',
    '.main-menu',
    '.navbar',
    '.nav-link',
    '.logo',
    '.mobile-nav-toggler'
  ],
  
  // Filtros de busca
  filters: [
    '.filter-sidebar',
    '.simple-search-bar',
    '.search-filter',
    '.search-input',
    '.filter-button',
    '.mobile-search-filter',
    '.filter-toggle'
  ],
  
  // Call to Action (CTA)
  cta: [
    '.btn',
    '.btn-primary',
    '.btn-secondary',
    '.cta-button',
    '.action-button',
    '.details-button'
  ],
  
  // Layout essencial
  layout: [
    '.boxcar-container',
    '.container',
    '.row',
    '.col-*',
    '.d-flex',
    '.d-block',
    '.d-none'
  ],
  
  // Tipografia crítica
  typography: [
    'h1', 'h2', 'h3',
    '.title',
    '.heading',
    '.text-primary',
    '.text-secondary'
  ]
};

// CSS crítico base (sempre incluir)
const BASE_CRITICAL_CSS = `
/* =================================================================== */
/* CSS CRÍTICO - ABOVE THE FOLD                                      */
/* Gerado automaticamente baseado no Coverage do Chrome              */
/* =================================================================== */

/* Reset e base */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-family: 'DM Sans', sans-serif;
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
}

/* Prevenir FOUC (Flash of Unstyled Content) */
.no-js {
  visibility: hidden;
}

/* Container crítico */
.boxcar-container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .boxcar-container { max-width: 540px; }
}
@media (min-width: 768px) {
  .boxcar-container { max-width: 720px; }
}
@media (min-width: 992px) {
  .boxcar-container { max-width: 960px; }
}
@media (min-width: 1200px) {
  .boxcar-container { max-width: 1140px; }
}
@media (min-width: 1400px) {
  .boxcar-container { max-width: 1320px; }
}
`;

// Função para processar CSS do Coverage
function processCoverageCSS(inputFile) {
  if (!fs.existsSync(inputFile)) {
    console.log('⚠️ Arquivo critical-coverage.css não encontrado!');
    console.log('Por favor, copie o CSS usado do Chrome Coverage para critical-coverage.css');
    return null;
  }
  
  const coverageCSS = fs.readFileSync(inputFile, 'utf8');
  console.log(`✅ CSS do Coverage carregado: ${(coverageCSS.length / 1024).toFixed(2)}KB`);
  
  return coverageCSS;
}

// Função para filtrar apenas CSS crítico
function filterCriticalCSS(css) {
  const lines = css.split('\n');
  const criticalRules = [];
  let inCriticalRule = false;
  let currentRule = '';
  
  // Seletores críticos (flatten do objeto CRITICAL_ELEMENTS)
  const criticalSelectors = Object.values(CRITICAL_ELEMENTS).flat();
  
  lines.forEach(line => {
    // Verificar se a linha contém um seletor crítico
    const containsCriticalSelector = criticalSelectors.some(selector => {
      // Tratar wildcards como col-*
      const regex = selector.replace('*', '\\w+');
      return line.match(new RegExp(regex));
    });
    
    if (containsCriticalSelector || inCriticalRule) {
      currentRule += line + '\n';
      
      if (line.includes('{')) {
        inCriticalRule = true;
      }
      if (line.includes('}')) {
        inCriticalRule = false;
        criticalRules.push(currentRule);
        currentRule = '';
      }
    }
  });
  
  return criticalRules.join('\n');
}

// Função para otimizar CSS
function optimizeCSS(css) {
  // Remover comentários
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remover espaços em branco excessivos
  css = css.replace(/\s+/g, ' ');
  
  // Remover espaços ao redor de seletores
  css = css.replace(/\s*([{}:;,])\s*/g, '$1');
  
  // Remover ponto e vírgula antes de }
  css = css.replace(/;}/g, '}');
  
  // Remover regras vazias
  css = css.replace(/[^}]+\{\s*\}/g, '');
  
  return css;
}

// Função principal
async function generateCriticalCSS() {
  console.log('📋 Passo 1: Processar CSS do Coverage');
  const coverageCSS = processCoverageCSS('critical-coverage.css');
  
  if (!coverageCSS) {
    console.log('\n📝 Instruções para extrair CSS do Coverage:');
    console.log('1. Abra o site no Chrome');
    console.log('2. Abra DevTools (F12) e pressione Ctrl+Shift+P');
    console.log('3. Digite "Coverage" e abra o painel');
    console.log('4. Clique em "Start instrumenting coverage and reload page"');
    console.log('5. Após reload, clique no arquivo CSS principal');
    console.log('6. Copie as regras usadas (em azul) para critical-coverage.css');
    console.log('7. Execute este script novamente');
    return;
  }
  
  console.log('\n📋 Passo 2: Filtrar CSS crítico (above the fold)');
  const filteredCSS = filterCriticalCSS(coverageCSS);
  
  console.log('\n📋 Passo 3: Combinar com CSS base');
  const combinedCSS = BASE_CRITICAL_CSS + '\n' + filteredCSS;
  
  console.log('\n📋 Passo 4: Otimizar CSS');
  const optimizedCSS = optimizeCSS(combinedCSS);
  
  // Salvar CSS crítico não minificado
  fs.writeFileSync('critical-coverage-full.css', combinedCSS);
  console.log(`✅ CSS crítico completo salvo: critical-coverage-full.css (${(combinedCSS.length / 1024).toFixed(2)}KB)`);
  
  // Salvar CSS crítico otimizado
  fs.writeFileSync('critical-coverage-optimized.css', optimizedCSS);
  console.log(`✅ CSS crítico otimizado salvo: critical-coverage-optimized.css (${(optimizedCSS.length / 1024).toFixed(2)}KB)`);
  
  // Gerar estatísticas
  console.log('\n📊 Estatísticas:');
  console.log(`   CSS Original: ${(coverageCSS.length / 1024).toFixed(2)}KB`);
  console.log(`   CSS Filtrado: ${(filteredCSS.length / 1024).toFixed(2)}KB`);
  console.log(`   CSS Final: ${(optimizedCSS.length / 1024).toFixed(2)}KB`);
  console.log(`   Redução: ${(100 - (optimizedCSS.length / coverageCSS.length * 100)).toFixed(1)}%`);
  
  // Gerar template HTML
  const htmlTemplate = `
<!-- CSS Crítico Inline (Above the Fold) -->
<style id="critical-css">
${optimizedCSS}
</style>

<!-- Preload do CSS principal -->
<link rel="preload" href="/src/index.css" as="style">

<!-- Carregar CSS não-crítico de forma assíncrona -->
<link rel="stylesheet" href="/src/index.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/src/index.css"></noscript>
`;
  
  fs.writeFileSync('critical-coverage-template.html', htmlTemplate);
  console.log('\n✅ Template HTML gerado: critical-coverage-template.html');
  
  console.log('\n🎯 CSS Crítico gerado com sucesso!');
  console.log('   Próximos passos:');
  console.log('   1. Revise critical-coverage-optimized.css');
  console.log('   2. Copie o conteúdo de critical-coverage-template.html para index.html');
  console.log('   3. Teste a performance com Lighthouse');
}

// Executar
generateCriticalCSS().catch(console.error);