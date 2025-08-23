import { PurgeCSS } from 'purgecss';
import fs from 'fs';
import path from 'path';

// Configuração com EXATAMENTE a mesma safelist do vite.config.js
const purgeStaticCSS = async () => {
  console.log('🧹 Iniciando purge do CSS estático...');
  console.log('⚠️  Fazendo backup dos arquivos originais...');

  // EXATAMENTE a mesma safelist do vite.config.js
  const purgeOptions = {
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
      './dist/**/*.{html,js}'
    ],
    safelist: [
      // Bootstrap states essenciais
      'collapse', 'show', 'active', 'fade', 'in',
      
      // Slick carousel classes
      'slick-slider', 'slick-slide', 'slick-track', 'slick-current', 
      'slick-dots', 'slick-arrow', 'slick-prev', 'slick-next',
      'slick-active', 'slick-center', 'slick-initialized',
      
      // Backgrounds específicos realmente usados
      'bg-blue-600', 'bg-blue-700', 'bg-gray-100', 'bg-gray-200', 'bg-black', 
      'bg-gradient-to-r', 'bg-1', 'bg-2', 'bg-4-1', 'bg-7',
      
      // Text classes específicas realmente usadas
      'text-2xl', 'text-4xl', 'text-center', 'text-gray-300', 'text-gray-400',
      'text-dk', 'text-font', 'text-box',
      
      // Spacing apenas os essenciais (limitados)
      'mt-5', 'mb-4', 'p-4', 'px-4', 'py-3', 'm-2', 'm-4',
      
      // Bootstrap core apenas essencial
      'container', 'container-fluid', 'row', 'btn', 'card', 'modal', 'navbar',
      'w-full', 'h-16', 'd-block', 'd-flex', 'justify-content-center', 'align-items-center',
      
      // Font Awesome APENAS os 38 ícones realmente usados
      'fa', 'fas', 'fab', 'far', 'fa-solid', 'fa-brands',
      'fa-angle-down', 'fa-angle-left', 'fa-angle-right', 'fa-angle-up',
      'fa-bars', 'fa-building', 'fa-calendar', 'fa-car', 'fa-cart-shopping',
      'fa-check', 'fa-check-circle', 'fa-circle-check', 'fa-clock',
      'fa-credit-card', 'fa-dollar-sign', 'fa-envelope',
      'fa-facebook-f', 'fa-google', 'fa-home', 'fa-instagram', 'fa-linkedin-in',
      'fa-location-dot', 'fa-map-marker-alt', 'fa-newspaper', 'fa-phone', 'fa-play',
      'fa-search', 'fa-sign-in-alt', 'fa-sign-out-alt', 'fa-star', 'fa-tachometer',
      'fa-thumbs-down', 'fa-thumbs-up', 'fa-times', 'fa-twitter', 'fa-upload',
      'fa-user', 'fa-whatsapp',
      
      // Layout crítico
      'hero-section', 'header', 'footer', 'nav-link', 'img-fluid',
      'wrapper-invoice', 'about-inner-one', 'layout-radius', 'inventory-section',
      'boxcar-container', 'boxcar-title-three', 'breadcrumb', 'title'
    ]
  };

  // Arquivos CSS estáticos a serem purgados
  const cssFilesToPurge = [
    'dist/css/fontawesome.css',
    'dist/css/style.css',
    'dist/css/bootstrap.min.css',
    'dist/css/animate.css'
  ];

  // Fazer backup e processar cada arquivo
  for (const cssFile of cssFilesToPurge) {
    if (fs.existsSync(cssFile)) {
      // 1. FAZER BACKUP PRIMEIRO
      const backupFile = `${cssFile}.backup-${Date.now()}`;
      fs.copyFileSync(cssFile, backupFile);
      console.log(`📋 Backup criado: ${path.basename(backupFile)}`);
      
      console.log(`🔍 Processando ${cssFile}...`);
      
      const originalSize = fs.statSync(cssFile).size;
      
      try {
        const purgeCSSResults = await new PurgeCSS().purge({
          ...purgeOptions,
          css: [cssFile]
        });

        if (purgeCSSResults && purgeCSSResults[0]) {
          const purgedCSS = purgeCSSResults[0].css;
          
          // 2. SOBRESCREVER APENAS APÓS BACKUP
          fs.writeFileSync(cssFile, purgedCSS);
          
          const newSize = fs.statSync(cssFile).size;
          const savedKB = Math.round((originalSize - newSize) / 1024);
          const newKB = Math.round(newSize / 1024);
          const percentage = Math.round((savedKB / (originalSize / 1024)) * 100);
          
          console.log(`✅ ${path.basename(cssFile)}: ${savedKB}KB removidos (${percentage}%) → ${newKB}KB restantes`);
        }
      } catch (error) {
        // Restaurar backup em caso de erro
        fs.copyFileSync(backupFile, cssFile);
        console.log(`❌ Erro ao processar ${cssFile}:`, error.message);
        console.log(`🔄 Arquivo restaurado do backup`);
      }
    }
  }
  
  // Calcular total economizado
  let totalSaved = 0;
  let totalSizeAfter = 0;
  
  for (const cssFile of cssFilesToPurge) {
    if (fs.existsSync(cssFile)) {
      totalSizeAfter += fs.statSync(cssFile).size;
    }
  }
  
  console.log(`\n🎯 RESUMO FINAL:`);
  console.log(`📦 CSS estático total após purge: ${Math.round(totalSizeAfter / 1024)}KB`);
  console.log(`✨ Purge do CSS estático concluído!`);
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  purgeStaticCSS().catch(console.error);
}

export default purgeStaticCSS;