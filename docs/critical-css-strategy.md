# Critical CSS Strategy - Átria Veículos

## 📖 Visão Geral
Implementação de estratégia Critical CSS para otimizar o First Contentful Paint (FCP) e melhorar a performance da página principal.

## 🎯 Objetivos
- **Target**: CSS crítico ≤ 14KB compactado
- **Foco**: Above-the-fold content (header + hero section)
- **Preservar**: Layout do hero e grid de veículos (conforme solicitação)
- **Método**: Inline critical CSS + defer restante

## 🛠️ Implementação

### Scripts Criados
- `scripts/critical-css-extractor.js` - Extrator inteligente de CSS crítico
- `scripts/build-with-critical.js` - Pipeline completo de build

### Workflows Configurados
- **"Build with Critical CSS"** - Build padrão + extração CSS crítico
- **"Full Optimized Build"** - Pipeline completo otimizado

## 🎛️ Configuração

### Seletores Críticos (Above-the-Fold)
```javascript
// Base essencial
'html', 'body', '*', '*:before', '*:after'

// Header/Navegação
'.header_area', '.main-header-area', '.navbar', '.navbar-brand'

// Hero Section (preservado)
'.banner-area', '.main-banner', '.hero-area', '.banner_content'

// Layout básico
'.container', '.container-fluid', '.row'

// Typography crítica
'h1', '.display-1', '.banner-title'

// Buttons do hero
'.btn-primary', '.banner-btn'
```

### Seletores Excluídos (Não Críticos)
```javascript
// Componentes below-the-fold
'.footer', '.testimonial', '.about', '.contact'
'.vehicle-grid', '.car-listing', '.pagination'
'.modal', '.dropdown-menu', '.accordion'

// Páginas específicas
'.single-car', '.inventory-page', '.finance-calculator'

// Third-party libraries
'.slick', '.photoswipe', '.chart'
```

### Propriedades CSS Críticas
```javascript
'display', 'position', 'width', 'height', 'margin', 'padding'
'font-size', 'font-weight', 'font-family', 'line-height'
'color', 'background-color', 'background-image'
'border', 'text-align', 'visibility', 'opacity'
```

## 🚀 Como Usar

### Build com Critical CSS
Execute o workflow "Build with Critical CSS" ou:
```bash
npm run build && node scripts/critical-css-extractor.js
```

### Build Completo Otimizado
Execute o workflow "Full Optimized Build" ou:
```bash
node scripts/build-with-critical.js
```

## 📊 Resultado Esperado

### Estrutura Final HTML
```html
<head>
  <!-- CSS crítico inlinado -->
  <style data-critical-css="true">
    /* ~14KB de CSS above-the-fold */
  </style>
  
  <!-- CSS restante deferido -->
  <link rel="preload" href="./assets/style.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="./assets/style.css"></noscript>
</head>
```

### Métricas de Performance
- **CSS crítico**: ≤ 14KB inlinado
- **CSS total**: ~1.2MB carregado assincronamente
- **FCP**: Melhoria significativa no First Contentful Paint
- **Layout**: Sem FOUC (Flash of Unstyled Content)

## 🔧 Vite.config.js Optimizações

### Chunk Splitting Inteligente
```javascript
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-ui': ['bootstrap', 'framer-motion', 'react-slick'],
  'vendor-charts': ['chart.js', 'react-chartjs-2'],
  'vendor-firebase': ['firebase']
}
```

### Asset Organization
```javascript
assetFileNames: (assetInfo) => {
  // Organiza assets por tipo (images/, fonts/, etc.)
  return `assets/${extType}/[name]-[hash][extname]`;
}
```

## 📋 Validação

### Checklist de Qualidade
- [ ] CSS crítico ≤ 14KB
- [ ] Hero section preservado
- [ ] Grid de veículos intacto
- [ ] Header/navegação funcionais
- [ ] Sem FOUC visível
- [ ] CSS completo carrega corretamente

### Testes Recomendados
1. **Lighthouse**: Verificar FCP e LCP
2. **DevTools Network**: Confirmar loading sequence
3. **Visual**: Validar que não há quebras de layout
4. **Mobile**: Testar responsividade above-the-fold

## 🐛 Troubleshooting

### CSS Crítico Muito Grande
- Refinar seletores críticos
- Reduzir propriedades incluídas
- Aumentar exclusões

### Layout Quebrado
- Verificar se seletores essenciais estão incluídos
- Validar propriedades críticas de layout
- Checar media queries responsivas

### FOUC Detectado
- Incluir mais CSS de typography/colors
- Verificar timing do CSS deferido
- Ajustar preload strategy

---
**Última atualização**: Janeiro 2025
**Status**: Implementado e otimizado
**Responsável**: Critical CSS Strategy Team