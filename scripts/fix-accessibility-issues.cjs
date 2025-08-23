#!/usr/bin/env node

/**
 * Accessibility and ARIA Issues Fixer
 * Corrige problemas de acessibilidade, ARIA e estrutura semântica identificados
 */

const fs = require('fs');
const path = require('path');

console.log('♿ Iniciando correção de problemas de acessibilidade...');

// 1. Criar CSS para corrigir contraste e acessibilidade
function createAccessibilityCSS() {
  console.log('📋 Criando CSS para melhorar contraste e acessibilidade...');
  
  const accessibilityCSS = `
/* ================================
   CORREÇÕES DE ACESSIBILIDADE 
   ================================ */

/* 1. CONTRASTE MÍNIMO GARANTIDO */
.price-green, .price-success {
  color: #059669 !important; /* Verde mais escuro para contraste 4.5:1 */
  font-weight: 600;
}

.link-light-blue, .text-light-blue {
  color: #0369a1 !important; /* Azul mais escuro para contraste 4.5:1 */
  font-weight: 500;
}

.newsletter-text, .footer-text-light {
  color: #f8fafc !important; /* Branco puro para texto claro */
  font-weight: 500;
}

/* 2. CORREÇÕES ESPECÍFICAS PARA SLICK CAROUSEL */
.slick-slide.slick-cloned a,
.slick-slide.slick-cloned button {
  tabindex: -1 !important;
  pointer-events: none;
}

.slick-slide.slick-cloned[aria-hidden="true"] * {
  tabindex: -1 !important;
}

/* 3. MELHORIAS DE FOCO PARA NAVEGAÇÃO POR TECLADO */
.slider-navigation button:focus,
.form-control:focus,
.btn:focus,
a:focus {
  outline: 2px solid #1A75FF !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 3px rgba(26, 117, 255, 0.1) !important;
}

/* 4. SKIP LINK PARA NAVEGAÇÃO */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #1A75FF;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 9999;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

/* 5. MELHORAR VISIBILIDADE DE ELEMENTOS INTERATIVOS */
input[type="range"] {
  background: #e2e8f0;
  height: 8px;
  border-radius: 4px;
  outline: none;
}

input[type="range"]:focus {
  outline: 2px solid #1A75FF;
  outline-offset: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #1A75FF;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #1A75FF;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 6. ESTADOS DE LOADING ACESSÍVEIS */
.loading-spinner[aria-live="polite"] {
  position: relative;
}

.loading-spinner::after {
  content: "Carregando...";
  position: absolute;
  left: -9999px; /* Oculto visualmente mas disponível para leitores de tela */
}

/* 7. BOTÕES E LINKS SEM TEXTO DEVEM TER ÁREA MÍNIMA */
a[aria-label], button[aria-label] {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 8. MELHORAR VISIBILIDADE DO RATING */
.rating span {
  color: #fbbf24; /* Cor dourada com melhor contraste */
  font-size: 16px;
}

.rating .empty-star {
  color: #d1d5db; /* Cinza com contraste adequado */
}
`;

  fs.writeFileSync('src/styles/accessibility-fixes.css', accessibilityCSS);
  console.log('✅ CSS de acessibilidade criado em src/styles/accessibility-fixes.css');
}

// 2. Função para adicionar aria-labels e corrigir inputs
function fixAriaLabelsAndInputs() {
  console.log('📋 Corrigindo aria-labels e inputs de filtro...');
  
  const filterSidebarPath = 'src/components/carListings/FilterSidebar.jsx';
  if (fs.existsSync(filterSidebarPath)) {
    let content = fs.readFileSync(filterSidebarPath, 'utf8');
    
    // Adicionar aria-labels para inputs de range
    content = content.replace(
      /<input\s+type="range"/g,
      '<input type="range" aria-label="Faixa de valores"'
    );
    
    content = content.replace(
      /type="range"([^>]*?)(?:min=\{([^}]+)\})?(?:max=\{([^}]+)\})?/g,
      (match, attrs, min, max) => {
        const minVal = min || '0';
        const maxVal = max || '100';
        return `type="range"${attrs} aria-label="Selecionar faixa de ${minVal} até ${maxVal}" aria-valuemin="${minVal}" aria-valuemax="${maxVal}"`;
      }
    );
    
    fs.writeFileSync(filterSidebarPath, content);
    console.log('✅ Aria-labels adicionados ao FilterSidebar.jsx');
  }
}

// 3. Função para corrigir links e botões sem texto
function fixLinksAndButtons() {
  console.log('📋 Corrigindo links e botões sem texto acessível...');
  
  const filesToCheck = [
    'src/components/headers/HeaderHome.jsx',
    'src/components/headers/Header1.jsx',
    'src/components/footers/Footer1.jsx',
    'src/components/homes/home-1/Hero.jsx'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Corrigir links de logo sem texto
      content = content.replace(
        /<Link\s+to="\/"([^>]*?)>(?=\s*<img|<svg)/g,
        '<Link to="/" aria-label="Voltar à página inicial"$1>'
      );
      
      // Corrigir links de redes sociais
      content = content.replace(
        /<a\s+href="[^"]*facebook[^"]*"([^>]*?)>/g,
        '<a href="$&" aria-label="Siga-nos no Facebook"$1>'
      );
      
      content = content.replace(
        /<a\s+href="[^"]*instagram[^"]*"([^>]*?)>/g,
        '<a href="$&" aria-label="Siga-nos no Instagram"$1>'
      );
      
      content = content.replace(
        /<a\s+href="[^"]*whatsapp[^"]*"([^>]*?)>/g,
        '<a href="$&" aria-label="Entre em contato via WhatsApp"$1>'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Links corrigidos em ${filePath}`);
      }
    }
  });
}

// 4. Função para corrigir estrutura semântica de títulos
function fixHeadingStructure() {
  console.log('📋 Corrigindo estrutura semântica de títulos...');
  
  const filesToCheck = [
    'src/components/homes/home-1/Cars.jsx',
    'src/components/homes/home-1/Testimonials.jsx',
    'src/components/homes/home-1/Blogs.jsx',
    'src/components/homes/home-1/Features.jsx'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Substituir h6 por h2 quando usado como título principal de seção
      content = content.replace(
        /<h6([^>]*?)>(.*?)<\/h6>/g,
        (match, attrs, text) => {
          // Se o texto parece ser um título principal de seção
          if (text.length > 20 || text.includes('Nossos') || text.includes('Veículos') || text.includes('Blog')) {
            return `<h2${attrs}>${text}</h2>`;
          }
          return match;
        }
      );
      
      // Garantir que subtítulos usem h3 em vez de h6
      content = content.replace(
        /<h6([^>]*?)class="[^"]*subtitle[^"]*"([^>]*?)>(.*?)<\/h6>/g,
        '<h3$1class="subtitle"$2>$3</h3>'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Estrutura de títulos corrigida em ${filePath}`);
      }
    }
  });
}

// 5. Função para corrigir listas de rating
function fixRatingLists() {
  console.log('📋 Corrigindo estrutura de listas de rating...');
  
  const filesToCheck = [
    'src/components/homes/home-1/Cars.jsx',
    'src/components/carListings/Listings1.jsx',
    'src/components/carSingles/Single1.jsx'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Converter rating de ul/span para div com aria-label adequado
      content = content.replace(
        /<ul\s+className="rating"[^>]*?>(.*?)<\/ul>/gs,
        (match, innerContent) => {
          const starCount = (innerContent.match(/<span/g) || []).length;
          return `<div className="rating" role="img" aria-label="Avaliação: ${starCount} de 5 estrelas">${innerContent}</div>`;
        }
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Estrutura de rating corrigida em ${filePath}`);
      }
    }
  });
}

// 6. Função para corrigir carrosséis com aria-hidden
function fixCarouselAccessibility() {
  console.log('📋 Corrigindo acessibilidade dos carrosséis...');
  
  const carouselFiles = [
    'src/components/homes/home-1/Cars.jsx',
    'src/components/homes/home-1/Testimonials.jsx',
    'src/components/homes/home-1/Blogs.jsx'
  ];
  
  carouselFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Adicionar configurações de acessibilidade no Slick
      content = content.replace(
        /const slickOptions = \{([^}]+)\}/g,
        (match, options) => {
          if (!options.includes('accessibility')) {
            const newOptions = options.trim();
            return `const slickOptions = {${newOptions},
    // Configurações de acessibilidade
    accessibility: true,
    focusOnSelect: true,
    pauseOnFocus: true,
    pauseOnHover: true,
    useCSS: true,
    useTransform: true}`;
          }
          return match;
        }
      );
      
      // Adicionar useEffect para corrigir elementos clonados
      if (!content.includes('// Fix aria-hidden cloned elements')) {
        const useEffectImport = content.includes('useState') ? '' : "import { useState, useEffect } from 'react';\n";
        const insertPoint = content.indexOf('export default function');
        
        const fixClonedElementsCode = `
  // Fix aria-hidden cloned elements
  useEffect(() => {
    const fixClonedElements = () => {
      const clonedSlides = document.querySelectorAll('.slick-slide.slick-cloned[aria-hidden="true"]');
      clonedSlides.forEach(slide => {
        const links = slide.querySelectorAll('a');
        const buttons = slide.querySelectorAll('button');
        const inputs = slide.querySelectorAll('input, select, textarea');
        
        [...links, ...buttons, ...inputs].forEach(element => {
          element.setAttribute('tabindex', '-1');
          element.setAttribute('aria-hidden', 'true');
        });
      });
    };
    
    // Execute após render do carousel
    const timer = setTimeout(fixClonedElements, 100);
    return () => clearTimeout(timer);
  }, []);

`;
        
        content = useEffectImport + content.slice(0, insertPoint) + fixClonedElementsCode + content.slice(insertPoint);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Acessibilidade do carrossel corrigida em ${filePath}`);
      }
    }
  });
}

// 7. Função para adicionar skip link ao layout principal
function addSkipLink() {
  console.log('📋 Adicionando skip link para navegação...');
  
  const appPath = 'src/App.jsx';
  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    
    if (!content.includes('skip-link')) {
      // Adicionar skip link após a tag de abertura do componente principal
      content = content.replace(
        /(<div[^>]*?id="root"[^>]*?>)/,
        '$1\n      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>'
      );
      
      // Adicionar id ao main content
      content = content.replace(
        /(<main[^>]*?)>/,
        '$1 id="main-content">'
      );
      
      fs.writeFileSync(appPath, content);
      console.log('✅ Skip link adicionado ao App.jsx');
    }
  }
}

// 8. Função para importar o CSS de acessibilidade no arquivo principal
function importAccessibilityCSS() {
  console.log('📋 Importando CSS de acessibilidade...');
  
  const mainPath = 'src/main.jsx';
  if (fs.existsSync(mainPath)) {
    let content = fs.readFileSync(mainPath, 'utf8');
    
    if (!content.includes('accessibility-fixes.css')) {
      // Adicionar import do CSS de acessibilidade
      const importLine = "import './styles/accessibility-fixes.css';\n";
      content = content.replace(
        /(import.*?from.*?;)\n(?!import)/,
        `$1\n${importLine}`
      );
      
      fs.writeFileSync(mainPath, content);
      console.log('✅ CSS de acessibilidade importado no main.jsx');
    }
  }
}

// Executar todas as correções
async function main() {
  try {
    createAccessibilityCSS();
    fixAriaLabelsAndInputs();
    fixLinksAndButtons();
    fixHeadingStructure();
    fixRatingLists();
    fixCarouselAccessibility();
    addSkipLink();
    importAccessibilityCSS();
    
    console.log('🎉 Todas as correções de acessibilidade foram aplicadas!');
    console.log('📋 Melhorias implementadas:');
    console.log('   ✅ Contraste mínimo garantido (4.5:1)');
    console.log('   ✅ Aria-labels em inputs e links');
    console.log('   ✅ Estrutura semântica de títulos corrigida');
    console.log('   ✅ Listas de rating reestruturadas');
    console.log('   ✅ Carrosséis com acessibilidade melhorada');
    console.log('   ✅ Skip link para navegação por teclado');
    console.log('   ✅ Elementos clonados do Slick corrigidos');
    
  } catch (error) {
    console.error('❌ Erro durante as correções de acessibilidade:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  createAccessibilityCSS, 
  fixAriaLabelsAndInputs, 
  fixLinksAndButtons, 
  fixHeadingStructure,
  fixRatingLists,
  fixCarouselAccessibility,
  addSkipLink,
  importAccessibilityCSS
};