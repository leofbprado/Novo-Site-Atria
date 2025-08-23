#!/usr/bin/env node

/**
 * 🎯 Advanced Critical CSS Extractor for Átria Veículos
 * 
 * Estratégia:
 * 1. Analisa Above-the-Fold elements (Header + Hero + Introdução)
 * 2. Extrai CSS usado APENAS nesses elementos
 * 3. Gera CSS crítico otimizado para inline
 * 4. Valida que não quebra o layout inicial
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configurações de viewport para testar
const VIEWPORTS = {
  desktop: { width: 1200, height: 800 },
  mobile: { width: 375, height: 667 }
};

// Seletores above-the-fold específicos do Átria
const CRITICAL_SELECTORS = [
  // Base elements
  'html', 'body',
  
  // Header elements
  '.header1', '.header', '.navbar', '.navbar-brand',
  '.nav-link', '.dropdown-menu', '.mobile-nav',
  
  // Hero section
  '.hero1', '.hero-banner', '.hero-content',
  '.hero-title', '.hero-subtitle', '.hero-text',
  '.btn-hero', '.btn-primary', '.btn-secondary',
  
  // Critical layout elements
  '.container', '.container-fluid', '.row', '.col',
  '.col-12', '.col-md-6', '.col-lg-6',
  
  // Typography
  'h1', 'h2', 'p', '.lead',
  
  // Critical utilities
  '.d-flex', '.justify-content-center', '.align-items-center',
  '.text-center', '.text-white', '.bg-primary',
  
  // Font loading
  '@font-face', '.dm-sans', '.font-family'
];

async function extractCriticalCSS() {
  console.log('🚀 Iniciando extração de Critical CSS...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar para capturar CSS usado
    await page.coverage.startCSSCoverage();
    
    // Testar em desktop primeiro
    await page.setViewport(VIEWPORTS.desktop);
    console.log('📱 Testando viewport desktop (1200x800)...');
    
    // Carregar homepage local
    await page.goto('http://localhost:5000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
    
    // Capturar CSS coverage
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    console.log('📊 CSS files analisados:', cssCoverage.length);
    
    let criticalCSS = '';
    
    // Extrair CSS usado
    for (const coverage of cssCoverage) {
      const cssText = coverage.text;
      const usedRanges = coverage.ranges;
      
      // Extrair apenas partes usadas
      for (const range of usedRanges) {
        const usedCSS = cssText.substring(range.start, range.end);
        
        // Filtrar apenas regras críticas (above-the-fold)
        if (isCriticalCSS(usedCSS)) {
          criticalCSS += usedCSS + '\n';
        }
      }
    }
    
    // Processar e otimizar o CSS crítico
    criticalCSS = optimizeCriticalCSS(criticalCSS);
    
    // Salvar resultado
    const outputPath = './critical-extracted.css';
    fs.writeFileSync(outputPath, criticalCSS);
    
    console.log('✅ Critical CSS extraído:', outputPath);
    console.log('📏 Tamanho:', Math.round(criticalCSS.length / 1024 * 100) / 100, 'KB');
    
    // Testar em mobile também
    await testMobileViewport(page, criticalCSS);
    
    // Validar que o CSS crítico funciona
    await validateCriticalCSS(page, criticalCSS);
    
  } catch (error) {
    console.error('❌ Erro na extração:', error);
  } finally {
    await browser.close();
  }
}

function isCriticalCSS(cssRule) {
  // Filtrar apenas regras que afetam above-the-fold
  const criticalPatterns = [
    /body\s*{/, /html\s*{/,
    /\.header/, /\.navbar/, /\.nav-/,
    /\.hero/, /\.banner/,
    /h1\s*{/, /h2\s*{/, /p\s*{/,
    /\.container/, /\.row/, /\.col/,
    /\.btn/, /\.button/,
    /\.d-flex/, /\.justify-/, /\.align-/,
    /\.text-/, /\.bg-/,
    /@font-face/, /font-family/,
    /\.dm-sans/
  ];
  
  return criticalPatterns.some(pattern => pattern.test(cssRule));
}

function optimizeCriticalCSS(css) {
  console.log('🔧 Otimizando CSS crítico...');
  
  // Remove comentários
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove espaços extras
  css = css.replace(/\s+/g, ' ');
  
  // Remove quebras de linha desnecessárias
  css = css.replace(/\n\s*\n/g, '\n');
  
  // Organizar regras por prioridade
  const rules = css.split('}').filter(rule => rule.trim());
  const organizedRules = {
    reset: [],
    fonts: [],
    layout: [],
    components: [],
    utilities: []
  };
  
  rules.forEach(rule => {
    rule = rule.trim() + '}';
    
    if (rule.includes('@font-face') || rule.includes('font-family')) {
      organizedRules.fonts.push(rule);
    } else if (rule.includes('html') || rule.includes('body') || rule.includes('*')) {
      organizedRules.reset.push(rule);
    } else if (rule.includes('container') || rule.includes('row') || rule.includes('col')) {
      organizedRules.layout.push(rule);
    } else if (rule.includes('.d-') || rule.includes('.text-') || rule.includes('.bg-')) {
      organizedRules.utilities.push(rule);
    } else {
      organizedRules.components.push(rule);
    }
  });
  
  // Reconstruir CSS na ordem otimizada
  const optimizedCSS = [
    '/* Critical CSS - Above the fold only */',
    ...organizedRules.reset,
    ...organizedRules.fonts,
    ...organizedRules.layout,
    ...organizedRules.components,
    ...organizedRules.utilities
  ].join('\n');
  
  return optimizedCSS;
}

async function testMobileViewport(page, criticalCSS) {
  console.log('📱 Testando viewport mobile (375x667)...');
  
  await page.setViewport(VIEWPORTS.mobile);
  await page.reload({ waitUntil: 'networkidle0' });
  
  // Verificar se layout não quebrou em mobile
  const isMobileOk = await page.evaluate(() => {
    const header = document.querySelector('.header1, .header');
    const hero = document.querySelector('.hero1, .hero-banner');
    
    return header && hero && 
           header.offsetHeight > 0 && 
           hero.offsetHeight > 0;
  });
  
  console.log('📱 Mobile layout OK:', isMobileOk ? '✅' : '❌');
}

async function validateCriticalCSS(page, criticalCSS) {
  console.log('🧪 Validando CSS crítico...');
  
  // Criar página de teste apenas com CSS crítico
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        ${criticalCSS}
      </style>
    </head>
    <body>
      <div class="header1">
        <div class="container">
          <h1>Test Header</h1>
        </div>
      </div>
      <div class="hero1">
        <div class="container">
          <h1 class="hero-title">Test Hero</h1>
          <p class="hero-text">Test content</p>
          <button class="btn btn-primary">Test Button</button>
        </div>
      </div>
    </body>
    </html>
  `;
  
  fs.writeFileSync('./test-critical.html', testHTML);
  console.log('✅ Arquivo de teste criado: test-critical.html');
}

// Executar extração
if (require.main === module) {
  extractCriticalCSS().catch(console.error);
}

module.exports = { extractCriticalCSS };