/**
 * CSS Lazy Loading Utilities
 * Carrega CSS específicos de componentes grandes apenas quando necessário
 */
import { useState, useEffect } from 'react';

class CSSLazyLoader {
  constructor() {
    this.loadedCSS = new Set();
  }

  /**
   * Carrega CSS de forma assíncrona
   * @param {string} cssPath - Caminho para o arquivo CSS
   * @param {string} id - ID único para o CSS
   * @returns {Promise} - Promise que resolve quando o CSS é carregado
   */
  loadCSS(cssPath, id) {
    return new Promise((resolve, reject) => {
      // Se já foi carregado, resolve imediatamente
      if (this.loadedCSS.has(id)) {
        resolve();
        return;
      }

      // Verifica se já existe no DOM
      if (document.getElementById(id)) {
        this.loadedCSS.add(id);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.id = id;
      
      link.onload = () => {
        this.loadedCSS.add(id);
        console.log(`✅ CSS carregado: ${cssPath}`);
        resolve();
      };
      
      link.onerror = () => {
        console.error(`❌ Erro ao carregar CSS: ${cssPath}`);
        reject(new Error(`Failed to load CSS: ${cssPath}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Carrega múltiplos CSS de forma assíncrona
   * @param {Array} cssArray - Array de objetos {path, id}
   * @returns {Promise} - Promise que resolve quando todos os CSS são carregados
   */
  loadMultipleCSS(cssArray) {
    const promises = cssArray.map(({ path, id }) => this.loadCSS(path, id));
    return Promise.all(promises);
  }

  /**
   * Carrega CSS específico para carousel/sliders
   */
  async loadCarouselCSS() {
    return this.loadMultipleCSS([
      { path: '/css/slick.css', id: 'slick-css' },
      { path: '/css/slick-theme.css', id: 'slick-theme-css' },
      { path: '/css/owl.css', id: 'owl-css' }
    ]);
  }

  /**
   * Carrega CSS específico para charts
   */
  async loadChartsCSS() {
    return this.loadCSS('/css/charts.css', 'charts-css');
  }

  /**
   * Carrega CSS específico para galeria de fotos
   */
  async loadGalleryCSS() {
    return this.loadMultipleCSS([
      { path: '/css/jquery.fancybox.min.css', id: 'fancybox-css' },
      { path: '/css/photoswipe.css', id: 'photoswipe-css' }
    ]);
  }

  /**
   * Carrega CSS específico para modais e popups
   */
  async loadModalCSS() {
    return this.loadCSS('/css/mmenu.css', 'mmenu-css');
  }

  /**
   * Carrega CSS específico para animações
   */
  async loadAnimationsCSS() {
    return this.loadCSS('/css/animate.css', 'animate-css');
  }

  /**
   * Preload CSS crítico para performance
   */
  preloadCSS(cssPath, id) {
    if (this.loadedCSS.has(id)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = cssPath;
    link.onload = () => {
      link.onload = null;
      link.rel = 'stylesheet';
      this.loadedCSS.add(id);
    };
    document.head.appendChild(link);
  }
}

// Instância singleton
export const cssLazyLoader = new CSSLazyLoader();

// Hook para React components
export const useLazyCSS = (cssType) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadCSS = async () => {
      try {
        switch (cssType) {
          case 'carousel':
            await cssLazyLoader.loadCarouselCSS();
            break;
          case 'charts':
            await cssLazyLoader.loadChartsCSS();
            break;
          case 'gallery':
            await cssLazyLoader.loadGalleryCSS();
            break;
          case 'modal':
            await cssLazyLoader.loadModalCSS();
            break;
          case 'animations':
            await cssLazyLoader.loadAnimationsCSS();
            break;
          default:
            console.warn(`CSS type "${cssType}" not recognized`);
            return;
        }
        setLoaded(true);
      } catch (error) {
        console.error('Error loading CSS:', error);
      }
    };

    loadCSS();
  }, [cssType]);

  return loaded;
};

export default cssLazyLoader;