const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { minify } = require('csso');

// Script para extrair CSS crítico da página
async function extractCriticalCSS() {
  console.log('🎯 Iniciando extração do Critical CSS...');
  
  // Lendo o HTML da build atual
  const distPath = './dist/index.html';
  if (!fs.existsSync(distPath)) {
    console.error('❌ Arquivo dist/index.html não encontrado. Execute npm run build primeiro.');
    return;
  }
  
  // Lendo todos os arquivos CSS da build
  const cssFiles = fs.readdirSync('./dist/assets')
    .filter(file => file.endsWith('.css'))
    .map(file => fs.readFileSync(path.join('./dist/assets', file), 'utf8'))
    .join('\n');
  
  // CSS crítico para above-the-fold (Hero + Nav)
  const criticalSelectors = [
    // Reset e base
    '*', 'html', 'body',
    
    // Navegação
    '.navbar', '.navbar-brand', '.navbar-nav', '.nav-link', '.nav-item',
    '.navbar-collapse', '.navbar-toggler', '.navbar-toggler-icon',
    '.header', '.header-inner', '.main-header', '.outer-box',
    '.logo', '.logo-box', '.menu-area', '.mobile-nav-toggler',
    
    // Hero
    '.hero-section', '.banner-section', '.content-box', '.inner',
    '.hero-title', '.hero-subtitle', '.hero-text', '.hero-content',
    '.btn', '.btn-primary', '.theme-btn', '.btn-one',
    '.image-box', '.hero-image', '.banner-image',
    
    // Container e Grid
    '.container', '.container-fluid', '.row', '.col-*',
    '.d-flex', '.justify-content-*', '.align-items-*',
    
    // Typography
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span',
    '.title', '.subtitle', '.text',
    
    // Utilities
    '.text-center', '.text-left', '.text-right',
    '.mt-*', '.mb-*', '.pt-*', '.pb-*', '.px-*', '.py-*',
    '.position-*', '.w-*', '.h-*'
  ];
  
  // Extraindo regras críticas
  const criticalCSS = extractMatchingCSS(cssFiles, criticalSelectors);
  
  // Minificando
  const minifiedCSS = minify(criticalCSS).css;
  
  // Adicionando otimizações de fontes
  const fontPreload = `
    /* Critical Font Loading */
    @font-face {
      font-family: 'DM Sans';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR232VmYD.woff2) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'DM Sans';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR232VmYD.woff2) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
  `;
  
  const finalCSS = fontPreload + minifiedCSS;
  
  // Salvando o CSS crítico
  fs.writeFileSync('./critical.min.css', finalCSS);
  
  console.log(`✅ Critical CSS extraído: ${(finalCSS.length / 1024).toFixed(2)}KB`);
  console.log('📁 Arquivo salvo em: ./critical.min.css');
  
  // Gerando HTML com Critical CSS inline
  generateHTMLWithCriticalCSS(finalCSS);
}

function extractMatchingCSS(css, selectors) {
  const rules = [];
  
  // Regex para encontrar regras CSS
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  
  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2].trim();
    
    // Verificar se o seletor corresponde aos críticos
    const isMatch = selectors.some(critical => {
      // Handle wildcards
      if (critical.includes('*')) {
        const pattern = critical.replace(/\*/g, '.*');
        return new RegExp(pattern).test(selector);
      }
      return selector.includes(critical);
    });
    
    if (isMatch) {
      rules.push(`${selector}{${declarations}}`);
    }
  }
  
  // Incluir @media queries importantes
  const mediaRegex = /@media[^{]+\{([^{}]*(\{[^}]*\}[^{}]*)*)\}/g;
  while ((match = mediaRegex.exec(css)) !== null) {
    const mediaRule = match[0];
    // Incluir apenas media queries para mobile
    if (mediaRule.includes('max-width: 768px') || mediaRule.includes('max-width: 991px')) {
      rules.push(mediaRule);
    }
  }
  
  return rules.join('\n');
}

function generateHTMLWithCriticalCSS(criticalCSS) {
  const htmlPath = './dist/index.html';
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Encontrar links CSS existentes
  const cssLinkRegex = /<link[^>]*rel="stylesheet"[^>]*>/g;
  const cssLinks = html.match(cssLinkRegex) || [];
  
  // Modificar links para carregamento assíncrono
  cssLinks.forEach(link => {
    if (!link.includes('critical')) {
      const asyncLink = link
        .replace('rel="stylesheet"', 'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"');
      
      const noscriptFallback = `<noscript>${link}</noscript>`;
      
      html = html.replace(link, `${asyncLink}\n    ${noscriptFallback}`);
    }
  });
  
  // Adicionar Critical CSS inline no head
  const criticalStyleTag = `
    <!-- Critical CSS for Above-the-Fold -->
    <style>${criticalCSS}</style>
    
    <!-- Preconnect to critical domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://res.cloudinary.com">
    
    <!-- Preload critical fonts -->
    <link rel="preload" href="https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR232VmYD.woff2" as="font" type="font/woff2" crossorigin>
  `;
  
  // Inserir antes do primeiro link CSS
  const headEndIndex = html.indexOf('</head>');
  html = html.slice(0, headEndIndex) + criticalStyleTag + html.slice(headEndIndex);
  
  // Salvar HTML otimizado
  fs.writeFileSync('./dist/index-critical.html', html);
  
  console.log('✅ HTML com Critical CSS inline gerado: ./dist/index-critical.html');
}

// Verificar se csso está disponível
try {
  require('csso');
  extractCriticalCSS();
} catch (e) {
  console.log('Instalando dependências necessárias...');
  const { execSync } = require('child_process');
  console.log('Por favor, use npm install csso puppeteer-core primeiro');
}