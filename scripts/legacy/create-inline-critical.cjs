#!/usr/bin/env node

/**
 * 🎯 Otimizador de Critical CSS Inline Ultra-Compacto
 * 
 * Objetivo: Reduzir de 9.50KB para < 3.5KB
 * Estratégia: Manter apenas elementos above-the-fold essenciais
 */

const fs = require('fs');

function createOptimizedCriticalCSS() {
  console.log('🚀 Criando Critical CSS Ultra-Otimizado...');
  
  // Critical CSS mínimo - apenas above-the-fold essencial
  const ultraCriticalCSS = `
/* Ultra Critical CSS - Above the Fold Only (< 3.5KB) */
*{box-sizing:border-box}
body{margin:0;font-family:"DM Sans",sans-serif;font-size:16px;line-height:1.6;color:#222;background:#fff}

/* Essential @font-face */
@font-face{font-family:'DM Sans';src:url('/fonts/dm-sans-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:'DM Sans';src:url('/fonts/dm-sans-700.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap}

/* Layout essencial */
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 15px}

/* Header crítico */
.boxcar-header{position:absolute;top:0;left:0;width:100%;z-index:999;padding:20px 0}
.main-box{display:flex;align-items:center;justify-content:space-between}
.logo-box .logo{max-height:60px;width:auto}
.navbar{display:flex;align-items:center;list-style:none;margin:0;padding:0}
.navbar li{margin:0 20px}
.navbar li a{color:#222;font-weight:500;text-decoration:none;padding:10px 0;display:block}
.navbar li a:hover{color:#1A75FF}

/* Hero essencial */
.boxcar-banner-section-v1{position:relative;min-height:100vh;display:flex;align-items:center;background:#1a2332;overflow:hidden}
.banner-bg{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1}
.banner-bg img{width:100%;height:100%;object-fit:cover;filter:brightness(.7)}
.banner-content{position:relative;z-index:10;text-align:center;color:#fff;max-width:800px;margin:0 auto;padding:0 20px}
.banner-content h2{font-size:3.5rem;font-weight:700;line-height:1.2;margin-bottom:20px;text-shadow:2px 2px 4px rgba(0,0,0,.5)}
.banner-content .text{font-size:1.2rem;margin-bottom:40px;opacity:.9}

/* Search box critical */
.banner-search{background:#fff;border-radius:50px;padding:15px;max-width:600px;margin:0 auto;display:flex;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.2)}
.search-input{flex:1;border:none;outline:none;padding:15px 20px;font-size:16px;background:transparent}
.search-btn{background:linear-gradient(135deg,#ff6b35 0%,#f7931e 100%);color:#fff;border:none;padding:15px 30px;border-radius:50px;font-weight:600;cursor:pointer}

/* Mobile crítico */
@media (max-width:768px){
.boxcar-banner-section-v1{min-height:80vh}
.banner-content h2{font-size:2rem}
.banner-content .text{font-size:1rem}
.navbar{display:none}
}
`.trim();

  console.log('📏 Tamanho do Critical CSS otimizado:', Math.round(ultraCriticalCSS.length/1024*100)/100, 'KB');
  
  // Salvar versões otimizadas
  fs.writeFileSync('./critical-optimized.css', ultraCriticalCSS);
  
  console.log('✅ Critical CSS ultra-otimizado criado');
  
  return ultraCriticalCSS;
}

function updateIndexHTML() {
  console.log('🔧 Atualizando index.html com Critical CSS otimizado...');
  
  const indexHTML = fs.readFileSync('./index.html', 'utf8');
  const optimizedCSS = createOptimizedCriticalCSS();
  
  // Remover os múltiplos blocos de CSS crítico existentes e substituir por um otimizado
  let updatedHTML = indexHTML;
  
  // Remover primeiro bloco CSS crítico (linha ~69-121)
  updatedHTML = updatedHTML.replace(
    /<!-- ⚡ CRITICAL CSS INLINE[\s\S]*?<\/style>/,
    `<!-- ⚡ CRITICAL CSS ULTRA-OTIMIZADO (3.5KB) - Above the fold apenas -->
    <style>
${optimizedCSS}
    </style>`
  );
  
  // Remover segundo bloco CSS crítico (linha ~144-254)
  updatedHTML = updatedHTML.replace(
    /<!-- CSS CRÍTICO INLINE[\s\S]*?<\/style>/,
    ''
  );
  
  // Backup do arquivo original
  fs.writeFileSync('./index-backup.html', indexHTML);
  
  // Salvar versão otimizada
  fs.writeFileSync('./index.html', updatedHTML);
  
  console.log('✅ index.html atualizado com Critical CSS otimizado');
  console.log('💾 Backup salvo em: index-backup.html');
  
  // Testar tamanho final
  console.log('🧪 Testando tamanho final...');
  const finalTest = require('./test-critical-css-performance.cjs');
  finalTest.testCriticalCSSPerformance();
}

if (require.main === module) {
  updateIndexHTML();
}

module.exports = { createOptimizedCriticalCSS, updateIndexHTML };