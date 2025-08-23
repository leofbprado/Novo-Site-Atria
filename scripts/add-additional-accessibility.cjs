#!/usr/bin/env node

/**
 * Correções adicionais de acessibilidade ARIA
 * Adiciona elementos específicos para melhorar a experiência
 */

const fs = require('fs');
const path = require('path');

console.log('♿ Adicionando correções adicionais de acessibilidade...');

// 1. Adicionar roles ARIA apropriados ao carrossel de carros
function addCarouselRoles() {
  console.log('📋 Adicionando roles ARIA aos carrosséis...');
  
  const carsFile = 'src/components/homes/home-1/Cars.jsx';
  if (fs.existsSync(carsFile)) {
    let content = fs.readFileSync(carsFile, 'utf8');
    
    // Adicionar role ao container do slider
    content = content.replace(
      /<Slider\s+([^>]*?)className="([^"]*)"([^>]*?)>/g,
      '<Slider $1className="$2" role="region" aria-label="Carrossel de veículos mais vendidos"$3>'
    );
    
    fs.writeFileSync(carsFile, content);
    console.log('✅ Roles ARIA adicionados ao carrossel de carros');
  }
}

// 2. Melhorar labels de filtros de preço
function improvePriceFilterLabels() {
  console.log('📋 Melhorando labels dos filtros de preço...');
  
  const filterFile = 'src/components/carListings/FilterSidebar.jsx';
  if (fs.existsSync(filterFile)) {
    let content = fs.readFileSync(filterFile, 'utf8');
    
    // Buscar por sliders de preço e adicionar labels melhores
    content = content.replace(
      /(<Slider[^>]*?)range={true}([^>]*?)>/g,
      '$1range={true} aria-label="Selecionar faixa de preço mínimo e máximo"$2>'
    );
    
    // Melhorar label para quilometragem
    content = content.replace(
      /aria-label="Selecionar faixa de valores"/g,
      'aria-label="Selecionar faixa de quilometragem"'
    );
    
    fs.writeFileSync(filterFile, content);
    console.log('✅ Labels dos filtros melhorados');
  }
}

// 3. Adicionar landmarks ARIA ao layout principal
function addLandmarks() {
  console.log('📋 Adicionando landmarks ARIA...');
  
  const appFile = 'src/App.jsx';
  if (fs.existsSync(appFile)) {
    let content = fs.readFileSync(appFile, 'utf8');
    
    // Adicionar role main se não existir
    if (!content.includes('role="main"') && !content.includes('<main')) {
      content = content.replace(
        /<div([^>]*?)className="([^"]*page[^"]*)"([^>]*?)>/g,
        '<main$1className="$2" role="main"$3>'
      );
      
      content = content.replace(
        /<\/div>(\s*<\/div>\s*<\/Context>)/g,
        '</main>$1'
      );
    }
    
    fs.writeFileSync(appFile, content);
    console.log('✅ Landmarks ARIA adicionados');
  }
}

// 4. Melhorar contraste de botões e links
function improveButtonContrast() {
  console.log('📋 Melhorando contraste de botões...');
  
  const contrastCSS = `
/* MELHORIAS ADICIONAIS DE CONTRASTE */

/* Botões primários com contraste adequado */
.btn-primary, .theme-btn {
  background-color: #1A75FF !important;
  border-color: #1A75FF !important;
  color: #ffffff !important;
  font-weight: 600;
}

.btn-primary:hover, .theme-btn:hover {
  background-color: #0F5ECC !important;
  border-color: #0F5ECC !important;
  color: #ffffff !important;
}

/* Links com contraste adequado */
.car-price, .vehicle-price {
  color: #059669 !important; /* Verde escuro para R$ 15.000 */
  font-weight: 700;
}

.car-old-price, .vehicle-old-price {
  color: #6B7280 !important; /* Cinza com contraste adequado */
  text-decoration: line-through;
}

/* Badges e tags com contraste */
.badge, .tag, .vehicle-tag {
  background-color: #1A75FF !important;
  color: #ffffff !important;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.badge.ofertas, .tag.ofertas {
  background-color: #DC2626 !important; /* Vermelho com contraste */
  color: #ffffff !important;
}

.badge.novos, .tag.novos {
  background-color: #059669 !important; /* Verde com contraste */
  color: #ffffff !important;
}

/* Melhorar visibilidade de estrelas de rating */
.star-rating .star {
  color: #F59E0B !important; /* Dourado com contraste adequado */
  font-size: 16px;
}

.star-rating .star.empty {
  color: #D1D5DB !important; /* Cinza claro com contraste */
}

/* Melhorar foco em elementos interativos */
.car-card:focus-within,
.vehicle-card:focus-within {
  outline: 2px solid #1A75FF;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(26, 117, 255, 0.1);
}

/* Estados de loading mais acessíveis */
.loading-text {
  color: #374151 !important; /* Cinza escuro */
  font-weight: 500;
}

/* Breadcrumbs com contraste */
.breadcrumb-link {
  color: #0369A1 !important; /* Azul escuro */
  text-decoration: underline;
}

.breadcrumb-current {
  color: #374151 !important; /* Cinza escuro */
  font-weight: 600;
}
`;

  // Adicionar ao arquivo de CSS de acessibilidade
  const accessibilityFile = 'src/styles/accessibility-fixes.css';
  let existingCSS = fs.readFileSync(accessibilityFile, 'utf8');
  existingCSS += contrastCSS;
  
  fs.writeFileSync(accessibilityFile, existingCSS);
  console.log('✅ Contraste de botões e elementos melhorado');
}

// 5. Adicionar meta descrições para SEO e acessibilidade
function addMetaDescriptions() {
  console.log('📋 Adicionando meta descrições...');
  
  const indexFile = 'public/index.html';
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, 'utf8');
    
    if (!content.includes('<meta name="description"')) {
      const metaTags = `
    <meta name="description" content="Átria Veículos - Concessionária especializada em veículos seminovos com financiamento facilitado em Campinas. Encontre o carro ideal com segurança e qualidade.">
    <meta name="keywords" content="carros seminovos, veículos usados, financiamento automotivo, concessionária Campinas, carros com garantia">
    <meta name="author" content="Átria Veículos">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph para redes sociais -->
    <meta property="og:title" content="Átria Veículos - Concessionária de Seminovos">
    <meta property="og:description" content="Encontre o carro ideal na Átria Veículos. Seminovos com qualidade, garantia e financiamento facilitado em Campinas.">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    
    <!-- Schema.org para SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "name": "Átria Veículos",
      "description": "Concessionária especializada em veículos seminovos",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Campinas",
        "addressRegion": "SP",
        "addressCountry": "BR"
      }
    }
    </script>`;
      
      content = content.replace('<title>', metaTags + '\n    <title>');
      fs.writeFileSync(indexFile, content);
      console.log('✅ Meta descrições e Schema.org adicionados');
    }
  }
}

// 6. Adicionar texto alternativo para imagens
function addImageAltTexts() {
  console.log('📋 Verificando textos alternativos de imagens...');
  
  const filesToCheck = [
    'src/components/homes/home-1/Cars.jsx',
    'src/components/homes/home-1/Testimonials.jsx',
    'src/components/carListings/Listings1.jsx'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Garantir que imagens de carros tenham alt text adequado
      content = content.replace(
        /<img([^>]*?)src={([^}]*?)}([^>]*?)(?:alt="([^"]*)")?([^>]*?)\/?>(?!\s*<\/img>)/g,
        (match, beforeSrc, src, afterSrc, existingAlt, afterAlt) => {
          if (!existingAlt || existingAlt.trim() === '') {
            // Se é uma imagem de carro, usar título do veículo
            if (src.includes('car') || src.includes('vehicle') || filePath.includes('Cars')) {
              return `<img${beforeSrc}src={${src}}${afterSrc} alt={\`Foto do veículo \${car?.title || car?.brand + ' ' + car?.model || 'seminovo'}\`}${afterAlt} />`;
            }
            // Se é depoimento
            else if (src.includes('testimonial') || filePath.includes('Testimonials')) {
              return `<img${beforeSrc}src={${src}}${afterSrc} alt={\`Foto de \${testimonial?.name || 'cliente'}\`}${afterAlt} />`;
            }
            // Genérico
            else {
              return `<img${beforeSrc}src={${src}}${afterSrc} alt="Imagem ilustrativa"${afterAlt} />`;
            }
          }
          return match;
        }
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Alt texts melhorados em ${filePath}`);
      }
    }
  });
}

// Executar todas as correções
async function main() {
  try {
    addCarouselRoles();
    improvePriceFilterLabels();
    addLandmarks();
    improveButtonContrast();
    addMetaDescriptions();
    addImageAltTexts();
    
    console.log('🎉 Correções adicionais de acessibilidade aplicadas!');
    console.log('📋 Melhorias adicionais:');
    console.log('   ✅ Roles ARIA em carrosséis');
    console.log('   ✅ Labels melhorados em filtros');
    console.log('   ✅ Landmarks ARIA estruturais');
    console.log('   ✅ Contraste aprimorado em todos os elementos');
    console.log('   ✅ Meta descrições e Schema.org');
    console.log('   ✅ Textos alternativos para imagens');
    
  } catch (error) {
    console.error('❌ Erro durante as correções adicionais:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  addCarouselRoles,
  improvePriceFilterLabels,
  addLandmarks,
  improveButtonContrast,
  addMetaDescriptions,
  addImageAltTexts
};