/**
 * Critical CSS Extractor - Átria Veículos
 * Extrai CSS crítico para melhorar o First Contentful Paint (FCP)
 * 
 * Implementação baseada nas especificações:
 * - Extrai CSS crítico (above-the-fold)
 * - Inlina automaticamente no <head>
 * - Carrega CSS restante de forma assíncrona
 * - Target: < 14KB CSS crítico compactado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CriticalCSSExtractor {
  constructor() {
    this.distPath = path.resolve(__dirname, '../dist');
    
    // Seletores ultra-específicos para only above-the-fold content
    this.criticalSelectors = [
      // Reset e base essencial (mínimo)
      'html', 'body', '*', '*:before', '*:after',
      
      // Header fixo crítico
      '.header_area', '.main-header-area', 
      '.navbar', '.navbar-brand', '.navbar-nav', '.nav-link',
      
      // Hero section específico (preservar conforme solicitado)
      '.banner-area', '.main-banner', '.hero-area', '.banner_content',
      '.banner-wrapper', '.hero-content', '.hero-title', '.hero-subtitle',
      
      // Container system mínimo
      '.container', '.container-fluid', '.row',
      
      // Grid crítico apenas para hero e header
      '.col-12', '.col-lg-6', '.col-md-6', 
      
      // Typography above-the-fold
      'h1', '.display-1', '.banner-title',
      
      // Buttons críticos do hero
      '.btn-primary', '.banner-btn',
      
      // Mobile navigation crítico
      '.mobile-menu', '.navbar-toggler',
      
      // CSS básico responsivo (mobile-first)
      '@media (max-width: 767px)',
      '@media (min-width: 768px)',
      
      // Animações essenciais do hero
      '.fade-in', '.aos-animate'
    ];
    
    // Seletores que devem ser EXCLUÍDOS (não críticos)
    this.excludeSelectors = [
      // Componentes não above-the-fold
      '.footer', '.testimonial', '.about', '.contact',
      '.vehicle-grid', '.car-listing', '.pagination',
      '.modal', '.dropdown-menu', '.accordion',
      
      // CSS de páginas específicas
      '.single-car', '.inventory-page', '.finance-calculator',
      
      // CSS de admin
      '.admin-panel', '.dashboard',
      
      // Bibliotecas third-party não críticas
      '.slick', '.photoswipe', '.chart',
      
      // Hover states e animations complexas
      ':hover', ':focus', ':active', '.transition-',
      
      // Print styles
      '@media print'
    ];
  }

  /**
   * Extrai regras CSS críticas com lógica avançada de filtragem
   */
  extractCriticalCSS(cssContent) {
    const criticalRules = [];
    const cssRules = this.parseCSS(cssContent);
    
    for (let rule of cssRules) {
      if (this.isCriticalRule(rule)) {
        // Otimiza a regra removendo declarações não essenciais
        const optimizedRule = this.optimizeRule(rule);
        if (optimizedRule.length > 0) {
          criticalRules.push(optimizedRule);
        }
      }
    }

    return criticalRules.join('\n');
  }

  /**
   * Parse CSS em regras individuais
   */
  parseCSS(cssContent) {
    const rules = [];
    const cssRuleRegex = /([^{}]+)\{([^{}]*)\}/g;
    let match;

    while ((match = cssRuleRegex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      
      if (selector && declarations) {
        rules.push({
          selector: selector,
          declarations: declarations,
          fullRule: match[0]
        });
      }
    }

    return rules;
  }

  /**
   * Determina se uma regra CSS é crítica
   */
  isCriticalRule(rule) {
    const selector = rule.selector.toLowerCase();
    
    // Primeiro verifica exclusões (prioridade alta)
    for (let excludePattern of this.excludeSelectors) {
      if (selector.includes(excludePattern.toLowerCase())) {
        return false;
      }
    }
    
    // Depois verifica inclusões críticas
    for (let criticalPattern of this.criticalSelectors) {
      if (selector.includes(criticalPattern.toLowerCase())) {
        // Validação adicional para garantir relevância
        return this.isRelevantForAboveFold(rule);
      }
    }
    
    return false;
  }

  /**
   * Valida se a regra é realmente relevante para above-the-fold
   */
  isRelevantForAboveFold(rule) {
    const declarations = rule.declarations.toLowerCase();
    const selector = rule.selector.toLowerCase();
    
    // Inclui regras essenciais de layout
    if (declarations.includes('display:') || 
        declarations.includes('position:') || 
        declarations.includes('width:') || 
        declarations.includes('height:') ||
        declarations.includes('margin:') ||
        declarations.includes('padding:')) {
      return true;
    }
    
    // Inclui typography crítica
    if (declarations.includes('font-') || 
        declarations.includes('color:') ||
        declarations.includes('text-')) {
      return true;
    }
    
    // Inclui backgrounds do hero
    if (selector.includes('hero') || selector.includes('banner')) {
      return true;
    }
    
    return false;
  }

  /**
   * Otimiza regra CSS removendo declarações não críticas
   */
  optimizeRule(rule) {
    const declarations = rule.declarations.split(';');
    const criticalDeclarations = [];
    
    for (let decl of declarations) {
      const declaration = decl.trim().toLowerCase();
      
      // Mantém apenas declarações essenciais para layout inicial
      if (this.isCriticalDeclaration(declaration)) {
        criticalDeclarations.push(decl.trim());
      }
    }
    
    if (criticalDeclarations.length > 0) {
      return `${rule.selector}{${criticalDeclarations.join(';')}}`;
    }
    
    return '';
  }

  /**
   * Determina se uma declaração CSS é crítica
   */
  isCriticalDeclaration(declaration) {
    const criticalProperties = [
      'display', 'position', 'top', 'left', 'right', 'bottom',
      'width', 'height', 'margin', 'padding',
      'font-size', 'font-weight', 'font-family', 'line-height',
      'color', 'background-color', 'background-image',
      'border', 'border-radius',
      'text-align', 'text-transform',
      'visibility', 'opacity',
      'z-index', 'overflow'
    ];
    
    return criticalProperties.some(prop => 
      declaration.startsWith(prop + ':') || declaration.startsWith(prop + ' :')
    );
  }

  /**
   * Minifica CSS removendo comentários e espaços desnecessários
   */
  minifyCSS(css) {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários
      .replace(/\s+/g, ' ') // Reduz espaços múltiplos
      .replace(/;\s*}/g, '}') // Remove último semicolon antes de }
      .replace(/{\s*/g, '{') // Remove espaços após {
      .replace(/;\s*/g, ';') // Remove espaços após ;
      .trim();
  }

  /**
   * Gera o HTML com CSS crítico inlinado
   */
  async generateCriticalHTML() {
    try {
      // Lê o HTML gerado pelo build
      const htmlPath = path.join(this.distPath, 'index.html');
      const cssPath = path.join(this.distPath, 'assets');
      
      if (!fs.existsSync(htmlPath)) {
        console.error('❌ index.html não encontrado em dist/');
        return false;
      }

      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Encontra arquivos CSS na pasta assets (verifica subpasta css também)
      let cssFiles = [];
      const cssSubPath = path.join(cssPath, 'css');
      
      // Verifica se existe subpasta css/ (nova organização)
      if (fs.existsSync(cssSubPath)) {
        cssFiles = fs.readdirSync(cssSubPath)
          .filter(file => file.endsWith('.css'))
          .filter(file => !file.includes('safari-fixes'))
          .map(file => path.join('css', file)); // Inclui o caminho da subpasta
      } else {
        // Fallback para estrutura antiga
        cssFiles = fs.readdirSync(cssPath)
          .filter(file => file.endsWith('.css'))
          .filter(file => !file.includes('safari-fixes'));
      }

      if (cssFiles.length === 0) {
        console.error('❌ Nenhum arquivo CSS encontrado em dist/assets/');
        return false;
      }

      // Processa o maior arquivo CSS (provavelmente o principal)
      let mainCSSFile = cssFiles.reduce((prev, current) => {
        const prevStats = fs.statSync(path.join(cssPath, prev));
        const currentStats = fs.statSync(path.join(cssPath, current));
        return currentStats.size > prevStats.size ? current : prev;
      });

      const fullCSSPath = path.join(cssPath, mainCSSFile);
      const cssContent = fs.readFileSync(fullCSSPath, 'utf8');

      // Extrai CSS crítico
      const criticalCSS = this.extractCriticalCSS(cssContent);
      const minifiedCriticalCSS = this.minifyCSS(criticalCSS);

      // Verifica tamanho do CSS crítico
      const criticalSize = Buffer.byteLength(minifiedCriticalCSS, 'utf8');
      console.log(`📏 Tamanho do CSS crítico: ${(criticalSize / 1024).toFixed(2)} KB`);

      if (criticalSize > 14336) { // 14KB limite
        console.warn(`⚠️  CSS crítico (${(criticalSize / 1024).toFixed(2)} KB) excede 14KB recomendados`);
      }

      // Cria a tag style para CSS crítico
      const criticalStyleTag = `<style data-critical-css="true">
${minifiedCriticalCSS}
</style>`;

      // Modifica o HTML para incluir CSS crítico e deferir o restante
      const assetPath = `/assets/${mainCSSFile}`;
      
      // Remove link original do CSS (considerando possível subpasta css/)
      const cssFileName = path.basename(mainCSSFile);
      htmlContent = htmlContent.replace(
        new RegExp(`<link[^>]*href="[^"]*${cssFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'),
        ''
      );

      // Remove múltiplos blocos de style existentes para evitar conflitos
      htmlContent = htmlContent.replace(/<style id="critical-css-final">[\s\S]*?<\/style>/g, '');
      htmlContent = htmlContent.replace(/<style data-critical-css="true">[\s\S]*?<\/style>/g, '');
      
      // Remove script loadCSS.js inexistente
      htmlContent = htmlContent.replace(/<script[^>]*src="[^"]*loadCSS\.js"[^>]*><\/script>/g, '');

      // Adiciona CSS crítico e CSS deferido no head
      const headCloseTag = '</head>';
      const criticalAndDeferredCSS = `
  ${criticalStyleTag}
  <link rel="preload" href="${assetPath}" as="style" onload="this.onload=null;this.rel='stylesheet'" data-deferred-css="true">
  <noscript><link rel="stylesheet" href="${assetPath}"></noscript>
${headCloseTag}`;

      htmlContent = htmlContent.replace(headCloseTag, criticalAndDeferredCSS);

      // Salva o HTML otimizado
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');

      console.log('✅ Critical CSS Strategy implementada com sucesso!');
      console.log(`📂 Arquivo processado: ${htmlPath}`);
      console.log(`🎯 CSS crítico: ${(criticalSize / 1024).toFixed(2)} KB inlinado`);
      console.log(`🚀 CSS restante: ${((fs.statSync(fullCSSPath).size - criticalSize) / 1024).toFixed(2)} KB deferido`);

      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar Critical CSS:', error.message);
      return false;
    }
  }
}

// Executa a extração quando chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new CriticalCSSExtractor();
  extractor.generateCriticalHTML();
}

export default CriticalCSSExtractor;