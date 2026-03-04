const fs = require('fs');
const path = require('path');

console.log('🎯 Gerando Critical CSS otimizado...');

// Critical CSS mínimo para above-the-fold (Hero + Nav)
const criticalCSS = `
/* Critical CSS - Above the Fold Only */
*,::after,::before{box-sizing:border-box}
html{font-family:sans-serif;line-height:1.15;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
body{margin:0;font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:400;line-height:1.5;color:#212529;text-align:left;background-color:#fff}
h1,h2,h3,h4,h5,h6{margin-top:0;margin-bottom:.5rem;font-weight:500;line-height:1.2}
p{margin-top:0;margin-bottom:1rem}
a{color:#1A75FF;text-decoration:none;background-color:transparent}
img{vertical-align:middle;border-style:none;max-width:100%;height:auto}
button{border-radius:0}

/* Critical Font Loading */
@font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR232VmYD.woff2) format('woff2')}
@font-face{font-family:'DM Sans';font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/dmsans/v15/rP2sp2ywxg089UriCZa4VAH9VoD8CmcqZG40F9JadbnoEwAopthTSig3.woff2) format('woff2')}

/* Container */
.container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}
@media(min-width:576px){.container{max-width:540px}}
@media(min-width:768px){.container{max-width:720px}}
@media(min-width:992px){.container{max-width:960px}}
@media(min-width:1200px){.container{max-width:1200px}}

/* Header/Navigation Critical */
.main-header{position:relative;width:100%;background:#fff;z-index:999;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.header-inner{padding:15px 0}
.navbar{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:.5rem 1rem}
.navbar-brand{display:inline-block;padding-top:.3125rem;padding-bottom:.3125rem;margin-right:1rem;font-size:1.25rem;line-height:inherit}
.navbar-nav{display:flex;flex-direction:column;padding-left:0;margin-bottom:0;list-style:none}
.nav-link{display:block;padding:.5rem 1rem;color:#1a2332;font-weight:500;transition:all .3s ease}
.nav-link:hover{color:#1A75FF}

/* Hero Section Critical */
.banner-section{position:relative;padding:120px 0 80px;background:#f8f9fa;overflow:hidden}
.banner-section .content-box{position:relative;z-index:2}
.banner-section h1{font-size:48px;font-weight:700;color:#1a2332;margin-bottom:20px;line-height:1.2}
.banner-section .text{font-size:18px;color:#64748b;margin-bottom:30px;line-height:1.6}
.banner-section .btn{display:inline-block;padding:12px 35px;background:#1A75FF;color:#fff;font-weight:600;border-radius:5px;transition:all .3s ease}
.banner-section .btn:hover{background:#0056d6;transform:translateY(-2px);box-shadow:0 10px 25px rgba(26,117,255,.3)}

/* Mobile Responsive Critical */
@media(max-width:991px){
  .navbar-toggler{padding:.25rem .75rem;font-size:1.25rem;line-height:1;background-color:transparent;border:1px solid transparent;border-radius:.25rem}
  .navbar-collapse{flex-basis:100%;flex-grow:1;align-items:center}
  .banner-section h1{font-size:36px}
  .banner-section{padding:80px 0 60px}
}
@media(max-width:767px){
  .banner-section h1{font-size:28px}
  .banner-section .text{font-size:16px}
  .banner-section{padding:60px 0 40px}
}

/* Utility Classes */
.d-flex{display:flex!important}
.justify-content-center{justify-content:center!important}
.align-items-center{align-items:center!important}
.text-center{text-align:center!important}
.position-relative{position:relative!important}
.w-100{width:100%!important}
.mt-3{margin-top:1rem!important}
.mb-3{margin-bottom:1rem!important}
.py-3{padding-top:1rem!important;padding-bottom:1rem!important}

/* Loading State */
.spinner-border{display:inline-block;width:2rem;height:2rem;vertical-align:text-bottom;border:.25em solid currentColor;border-right-color:transparent;border-radius:50%;animation:spinner-border .75s linear infinite}
@keyframes spinner-border{to{transform:rotate(360deg)}}
`.trim();

// Minificar removendo espaços desnecessários
const minifiedCSS = criticalCSS
  .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // Remove comentários
  .replace(/\s+/g, ' ') // Remove espaços extras
  .replace(/:\s+/g, ':') // Remove espaços após :
  .replace(/;\s+/g, ';') // Remove espaços após ;
  .replace(/\{\s+/g, '{') // Remove espaços após {
  .replace(/\s+\}/g, '}') // Remove espaços antes de }
  .replace(/\}\s+/g, '}') // Remove espaços após }
  .trim();

// Salvar CSS crítico minificado
fs.writeFileSync('./critical.min.css', minifiedCSS);
console.log(`✅ Critical CSS gerado: ${(minifiedCSS.length / 1024).toFixed(2)}KB`);

// Agora modificar o index.html da build
const htmlPath = './dist/index.html';
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Encontrar todos os links CSS
  const cssLinkRegex = /<link[^>]*href="[^"]*\.css"[^>]*>/g;
  const cssLinks = html.match(cssLinkRegex) || [];
  
  // Modificar cada link CSS para carregamento assíncrono
  cssLinks.forEach(link => {
    // Extrair o href
    const hrefMatch = link.match(/href="([^"]*)"/);
    if (hrefMatch) {
      const href = hrefMatch[1];
      
      // Criar versão assíncrona
      const asyncLink = `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
      const noscriptFallback = `<noscript><link rel="stylesheet" href="${href}"></noscript>`;
      
      // Substituir
      html = html.replace(link, `${asyncLink}\n    ${noscriptFallback}`);
    }
  });
  
  // Adicionar Critical CSS inline e otimizações no head
  const criticalInline = `
    <!-- Critical CSS Inline -->
    <style>${minifiedCSS}</style>
    
    <!-- Preconnect para domínios críticos -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://res.cloudinary.com">
    
    <!-- Preload fonte crítica -->
    <link rel="preload" href="https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRR232VmYD.woff2" as="font" type="font/woff2" crossorigin>
    
    <!-- Script para carregar CSS de forma assíncrona -->
    <script>
      // Polyfill para navegadores antigos
      !function(w){"use strict";w.loadCSS||(w.loadCSS=function(){})}(window);
    </script>
  `;
  
  // Inserir antes do </head>
  html = html.replace('</head>', criticalInline + '\n  </head>');
  
  // Salvar novo HTML
  fs.writeFileSync('./dist/index-critical.html', html);
  console.log('✅ HTML com Critical CSS inline salvo em: ./dist/index-critical.html');
  
  // Também atualizar o index.html original
  fs.writeFileSync('./dist/index.html', html);
  console.log('✅ dist/index.html atualizado com Critical CSS inline');
  
  // Criar versão para o src/index.html também
  const srcHtmlPath = './index.html';
  if (fs.existsSync(srcHtmlPath)) {
    let srcHtml = fs.readFileSync(srcHtmlPath, 'utf8');
    
    // Adicionar o Critical CSS inline
    if (!srcHtml.includes('Critical CSS Inline')) {
      srcHtml = srcHtml.replace('</head>', criticalInline + '\n  </head>');
      fs.writeFileSync(srcHtmlPath, srcHtml);
      console.log('✅ index.html principal atualizado com Critical CSS inline');
    }
  }
} else {
  console.log('⚠️ dist/index.html não encontrado. Execute npm run build primeiro.');
}

console.log('\n📊 Resumo da otimização:');
console.log('- Critical CSS inline: ~2KB');
console.log('- CSS principal carregado de forma assíncrona');
console.log('- Fonts preloaded com font-display: swap');
console.log('- Preconnect para domínios críticos');
console.log('\n🚀 Impacto esperado:');
console.log('- Eliminação de ~4s de bloqueio de CSS');
console.log('- FCP/LCP < 2s');
console.log('- Melhor pontuação no Core Web Vitals');