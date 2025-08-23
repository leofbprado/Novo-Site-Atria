const fs = require('fs');
const path = require('path');

// Extrair Critical CSS dos builds CSS
function extractFromBuildCSS() {
  console.log('🔍 Extraindo Critical CSS do build...');
  
  const distAssets = './dist/assets';
  if (!fs.existsSync(distAssets)) {
    console.log('❌ Pasta dist/assets não encontrada');
    return null;
  }
  
  const cssFiles = fs.readdirSync(distAssets)
    .filter(file => file.endsWith('.css'))
    .map(file => path.join(distAssets, file));
  
  console.log('📁 CSS files no build:', cssFiles.length);
  
  let allCSS = '';
  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    allCSS += content + '\n';
    console.log(`📖 ${file}: ${Math.round(content.length/1024)}KB`);
  });
  
  // Critical CSS específico para Above-the-fold
  const criticalCSS = `
/* Critical CSS - Above the Fold Only */
html{scroll-behavior:smooth}
body{margin:0;padding:0;font-family:'DM Sans',sans-serif;line-height:1.6;color:#333;background:#fff}
*,::before,::after{box-sizing:border-box}

/* Layout containers */
.container{max-width:1200px;margin:0 auto;padding:0 15px}
.row{display:flex;flex-wrap:wrap;margin:0 -15px}
.col,.col-6,.col-md-6,.col-lg-6{padding:0 15px;flex:1}

/* Header */
.header1{background:#fff;position:fixed;top:0;left:0;right:0;z-index:1000;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.navbar{padding:15px 0}
.navbar-brand{font-size:1.5rem;font-weight:700;color:#1A75FF;text-decoration:none}
.nav-link{color:#333;text-decoration:none;padding:8px 15px;transition:color 0.3s}
.nav-link:hover{color:#1A75FF}

/* Hero Section */
.hero1{padding:120px 0 80px;background:linear-gradient(135deg,#1A75FF 0%,#2a85ff 100%);color:#fff;position:relative}
.hero-title{font-size:3rem;font-weight:700;margin-bottom:20px;line-height:1.2}
.hero-text{font-size:1.2rem;margin-bottom:30px;opacity:0.9}

/* Buttons */
.btn{display:inline-block;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:500;border:none;cursor:pointer;transition:all 0.3s}
.btn-primary{background:#FF6B35;color:#fff}
.btn-primary:hover{background:#e55a2b;transform:translateY(-2px)}
.btn-outline{background:transparent;color:#fff;border:2px solid #fff}
.btn-outline:hover{background:#fff;color:#1A75FF}

/* Utilities */
.text-center{text-align:center}
.text-white{color:#fff}
.d-flex{display:flex}
.justify-content-center{justify-content:center}
.align-items-center{align-items:center}

/* Mobile */
@media (max-width:768px){
  .hero-title{font-size:2rem}
  .hero-text{font-size:1rem}
  .btn{padding:10px 20px;font-size:0.9rem}
  .container{padding:0 10px}
}
`.trim();
  
  console.log('✅ Critical CSS gerado manualmente');
  console.log('📏 Tamanho:', Math.round(criticalCSS.length/1024*100)/100, 'KB');
  
  // Salvar Critical CSS
  fs.writeFileSync('./critical-final.css', criticalCSS);
  
  // Gerar template HTML inline
  const inlineHTML = `<style>
${criticalCSS}
</style>`;
  
  fs.writeFileSync('./critical-inline-final.html', inlineHTML);
  
  return criticalCSS;
}

if (require.main === module) {
  extractFromBuildCSS();
}

module.exports = { extractFromBuildCSS };