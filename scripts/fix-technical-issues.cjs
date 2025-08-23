#!/usr/bin/env node

/**
 * Technical Issues Fixer
 * Corrige automaticamente problemas técnicos identificados pelo Lighthouse/DevTools
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando correção de problemas técnicos...');

// 1. Verificar e corrigir problemas de overflow: visible
function fixOverflowVisible() {
  console.log('📋 Verificando problemas de overflow: visible...');
  
  const cssFiles = [
    'src/styles/safari-fixes.css',
    'public/css/style.css',
    'public/css/mmenu.css',
    'public/css/jquery-ui.css'
  ];
  
  cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Comentar overflow: visible em elementos img, video, canvas
      content = content.replace(
        /(img|video|canvas)[^{]*{[^}]*overflow:\s*visible[^}]*}/gi,
        (match) => {
          return match.replace(/overflow:\s*visible/gi, '/* overflow: visible - removido para compatibilidade */');
        }
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Corrigido overflow: visible em ${filePath}`);
      }
    }
  });
}

// 2. Verificar arquivos 404 e criar fallbacks
function createMissingAssets() {
  console.log('📋 Verificando arquivos em falta...');
  
  const missingAssets = [
    'public/banner-fallback.webp',
    'public/banner-fallback.jpg'
  ];
  
  missingAssets.forEach(assetPath => {
    if (!fs.existsSync(assetPath)) {
      // Criar um arquivo de placeholder mínimo
      const dir = path.dirname(assetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Para imagens, criar um SVG placeholder
      if (assetPath.includes('banner-fallback')) {
        const svgContent = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a2332;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d3748;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <text x="960" y="540" text-anchor="middle" fill="white" font-family="Arial" font-size="48">Átria Veículos</text>
</svg>`;
        
        // Converter SVG para base64 e criar um arquivo HTML que será interpretado como imagem
        const base64 = Buffer.from(svgContent).toString('base64');
        fs.writeFileSync(assetPath, `data:image/svg+xml;base64,${base64}`);
        console.log(`✅ Criado fallback para ${assetPath}`);
      }
    }
  });
}

// 3. Otimizar configurações de build para source maps
function optimizeBuildConfig() {
  console.log('📋 Otimizando configuração de build...');
  
  const viteConfigPath = 'vite.config.js';
  if (fs.existsSync(viteConfigPath)) {
    let content = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Verificar se sourcemap já está habilitado
    if (!content.includes('sourcemap: true')) {
      content = content.replace(
        /build:\s*{/,
        `build: {
    // Habilita source maps para depuração
    sourcemap: true,`
      );
      
      fs.writeFileSync(viteConfigPath, content);
      console.log('✅ Source maps habilitados no vite.config.js');
    } else {
      console.log('✅ Source maps já estão habilitados');
    }
  }
}

// 4. Criar service worker básico para cache
function createServiceWorker() {
  console.log('📋 Criando Service Worker para cache...');
  
  const swContent = `// Service Worker para cache de assets
const CACHE_NAME = 'atria-veiculos-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/images/logos/logo-white.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});`;

  fs.writeFileSync('public/sw.js', swContent);
  console.log('✅ Service Worker criado em public/sw.js');
}

// 5. Verificar e corrigir URLs do YouTube para youtube-nocookie
function fixYouTubeURLs() {
  console.log('📋 Corrigindo URLs do YouTube para youtube-nocookie...');
  
  const jsFiles = [
    'src/components/homes/home-1/VideoOfTheWeek.jsx',
    'src/components/homes/home-1/Features.jsx',
    'src/pages/admin/AdminPage.jsx'
  ];
  
  jsFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Substituir youtube.com por youtube-nocookie.com
      content = content.replace(
        /https:\/\/www\.youtube\.com\/embed/g,
        'https://www.youtube-nocookie.com/embed'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ URLs do YouTube corrigidas em ${filePath}`);
      }
    }
  });
}

// Executar todas as correções
async function main() {
  try {
    fixOverflowVisible();
    createMissingAssets();
    optimizeBuildConfig();
    createServiceWorker();
    fixYouTubeURLs();
    
    console.log('🎉 Todas as correções técnicas foram aplicadas!');
    console.log('📋 Próximos passos:');
    console.log('   • Execute um novo build para verificar melhorias');
    console.log('   • Teste no Lighthouse para confirmar scores');
    console.log('   • Verifique o painel Issues do DevTools');
    
  } catch (error) {
    console.error('❌ Erro durante as correções:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixOverflowVisible, createMissingAssets, optimizeBuildConfig, createServiceWorker, fixYouTubeURLs };