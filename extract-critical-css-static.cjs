#!/usr/bin/env node

/**
 * 🎯 Static Critical CSS Extractor para Átria Veículos
 * 
 * Estratégia sem puppeteer:
 * 1. Analisa arquivos CSS existentes
 * 2. Identifica regras above-the-fold por padrões
 * 3. Extrai CSS crítico para inline
 * 4. Gera arquivo otimizado
 */

const fs = require('fs');
const path = require('path');

// Padrões CSS críticos (above-the-fold)
const CRITICAL_PATTERNS = [
  // Reset e base
  /^html\s*{[^}]*}/gm,
  /^body\s*{[^}]*}/gm,
  /^\*[^{]*{[^}]*}/gm,
  
  // Typography base
  /^h1\s*{[^}]*}/gm,
  /^h2\s*{[^}]*}/gm,
  /^p\s*{[^}]*}/gm,
  
  // Layout containers
  /\.container[^{]*{[^}]*}/gm,
  /\.container-fluid[^{]*{[^}]*}/gm,
  /\.row[^{]*{[^}]*}/gm,
  /\.col[^{]*{[^}]*}/gm,
  
  // Header específico
  /\.header1[^{]*{[^}]*}/gm,
  /\.header[^{]*{[^}]*}/gm,
  /\.navbar[^{]*{[^}]*}/gm,
  /\.navbar-brand[^{]*{[^}]*}/gm,
  /\.nav-link[^{]*{[^}]*}/gm,
  
  // Hero section
  /\.hero1[^{]*{[^}]*}/gm,
  /\.hero-banner[^{]*{[^}]*}/gm,
  /\.hero-content[^{]*{[^}]*}/gm,
  /\.hero-title[^{]*{[^}]*}/gm,
  /\.hero-text[^{]*{[^}]*}/gm,
  
  // Buttons críticos
  /\.btn[^{]*{[^}]*}/gm,
  /\.btn-primary[^{]*{[^}]*}/gm,
  /\.btn-hero[^{]*{[^}]*}/gm,
  
  // Utilities críticas
  /\.d-flex[^{]*{[^}]*}/gm,
  /\.justify-content-[^{]*{[^}]*}/gm,
  /\.align-items-[^{]*{[^}]*}/gm,
  /\.text-center[^{]*{[^}]*}/gm,
  /\.text-white[^{]*{[^}]*}/gm,
  
  // Font faces
  /@font-face[^{]*{[^}]*}/gm,
  /\.dm-sans[^{]*{[^}]*}/gm,
];

// Patterns para remover (não críticos)
const NON_CRITICAL_PATTERNS = [
  // Footer
  /\.footer[^{]*{[^}]*}/gm,
  
  // Modals e popups
  /\.modal[^{]*{[^}]*}/gm,
  /\.popup[^{]*{[^}]*}/gm,
  
  // Componentes que não estão above-the-fold
  /\.testimonials[^{]*{[^}]*}/gm,
  /\.brands[^{]*{[^}]*}/gm,
  /\.features[^{]*{[^}]*}/gm,
  /\.blog[^{]*{[^}]*}/gm,
  
  // Animações complexas
  /@keyframes[^{]*{[^}]*}/gm,
  /\.animate[^{]*{[^}]*}/gm,
  /\.wow[^{]*{[^}]*}/gm,
];

function findCSSFiles() {
  console.log('🔍 Buscando arquivos CSS...');
  
  const cssFiles = [];
  const searchDirs = ['./dist/assets', './src/assets/css', './css'];
  
  searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.css')) {
          cssFiles.push(path.join(dir, file));
        }
      });
    }
  });
  
  console.log('📁 Arquivos CSS encontrados:', cssFiles.length);
  return cssFiles;
}

function extractCriticalCSS() {
  console.log('🚀 Iniciando extração de Critical CSS...');
  
  const cssFiles = findCSSFiles();
  let allCSS = '';
  
  // Ler todos os arquivos CSS
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      allCSS += content + '\n';
      console.log('📖 Lido:', file, `(${Math.round(content.length/1024)}KB)`);
    }
  });
  
  if (!allCSS) {
    console.log('❌ Nenhum CSS encontrado. Tentando gerar build...');
    return false;
  }
  
  console.log('📏 CSS total:', Math.round(allCSS.length/1024), 'KB');
  
  // Extrair regras críticas
  let criticalCSS = '';
  
  CRITICAL_PATTERNS.forEach(pattern => {
    const matches = allCSS.match(pattern);
    if (matches) {
      matches.forEach(match => {
        criticalCSS += match + '\n';
      });
    }
  });
  
  // Remover regras não críticas
  NON_CRITICAL_PATTERNS.forEach(pattern => {
    criticalCSS = criticalCSS.replace(pattern, '');
  });
  
  // Otimizar e limpar
  criticalCSS = optimizeCSS(criticalCSS);
  
  // Salvar resultado
  const outputPath = './critical-inline.css';
  fs.writeFileSync(outputPath, criticalCSS);
  
  console.log('✅ Critical CSS extraído!');
  console.log('📏 Tamanho crítico:', Math.round(criticalCSS.length/1024*100)/100, 'KB');
  console.log('💾 Salvo em:', outputPath);
  
  // Gerar versão inline para HTML
  generateInlineVersion(criticalCSS);
  
  return criticalCSS;
}

function optimizeCSS(css) {
  console.log('🔧 Otimizando CSS...');
  
  // Remove comentários
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove espaços extras
  css = css.replace(/\s+/g, ' ');
  
  // Remove quebras de linha desnecessárias
  css = css.replace(/\n\s*\n/g, '\n');
  
  // Minificar
  css = css.replace(/;\s*}/g, '}');
  css = css.replace(/{\s+/g, '{');
  css = css.replace(/}\s+/g, '}');
  css = css.replace(/:\s+/g, ':');
  css = css.replace(/,\s+/g, ',');
  
  // Remove duplicatas
  const rules = css.split('}').filter(rule => rule.trim());
  const uniqueRules = [...new Set(rules)];
  
  return uniqueRules.join('}\n') + '}';
}

function generateInlineVersion(criticalCSS) {
  const inlineTemplate = `<!-- Critical CSS - Inline for Above the Fold -->
<style>
${criticalCSS}
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="/assets/index-[HASH].css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/index-[HASH].css"></noscript>`;

  fs.writeFileSync('./critical-inline.html', inlineTemplate);
  console.log('📝 Template HTML gerado: critical-inline.html');
}

// Executar extração
if (require.main === module) {
  const result = extractCriticalCSS();
  if (!result) {
    console.log('🔄 Executando build primeiro...');
    require('child_process').exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no build:', error);
      } else {
        console.log('✅ Build concluído, tentando novamente...');
        setTimeout(() => extractCriticalCSS(), 2000);
      }
    });
  }
}

module.exports = { extractCriticalCSS };