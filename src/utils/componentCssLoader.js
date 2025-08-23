/**
 * Component-specific CSS Lazy Loader
 * Carrega CSS apenas quando componentes específicos são renderizados
 */

class ComponentCssLoader {
  constructor() {
    this.loadedStyles = new Set();
    this.loadingPromises = new Map();
  }

  /**
   * Carrega CSS de forma assíncrona com fallback
   * @param {string} cssPath - Caminho para o CSS
   * @param {string} id - ID único
   */
  async loadCSS(cssPath, id) {
    // Se já está carregando, retorna a promise existente
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id);
    }

    // Se já foi carregado, resolve imediatamente
    if (this.loadedStyles.has(id) || document.getElementById(id)) {
      return Promise.resolve();
    }

    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.id = id;
      
      link.onload = () => {
        this.loadedStyles.add(id);
        this.loadingPromises.delete(id);
        console.log(`✅ CSS carregado: ${cssPath}`);
        resolve();
      };
      
      link.onerror = () => {
        this.loadingPromises.delete(id);
        console.warn(`⚠️ CSS não encontrado (fallback): ${cssPath}`);
        // Não rejeitamos - continuamos sem o CSS
        resolve();
      };

      document.head.appendChild(link);
    });

    this.loadingPromises.set(id, promise);
    return promise;
  }

  /**
   * Carrega CSS para carousels/sliders
   */
  async loadCarouselCSS() {
    return Promise.allSettled([
      this.loadCSS('/css/slick.css', 'slick-carousel-css'),
      this.loadCSS('/css/slick-theme.css', 'slick-theme-css'),
      this.loadCSS('/css/carousel-lazy.css', 'carousel-lazy-css')
    ]);
  }

  /**
   * Carrega CSS para animações
   */
  async loadAnimationCSS() {
    return Promise.allSettled([
      this.loadCSS('/css/animate.css', 'animate-css'),
      this.loadCSS('/css/animations-lazy.css', 'animations-lazy-css')
    ]);
  }

  /**
   * Carrega CSS para galerias
   */
  async loadGalleryCSS() {
    return this.loadCSS('/css/jquery.fancybox.min.css', 'fancybox-css');
  }

  /**
   * Remove CSS quando componente é desmontado (opcional)
   */
  unloadCSS(id) {
    const link = document.getElementById(id);
    if (link) {
      link.remove();
      this.loadedStyles.delete(id);
    }
  }
}

// Instância singleton
export const componentCssLoader = new ComponentCssLoader();

/**
 * Hook para carregar CSS de componente específico
 * @param {string} cssType - Tipo de CSS (carousel, gallery, animation)
 * @param {boolean} shouldLoad - Se deve carregar o CSS
 */
export const useComponentCSS = (cssType, shouldLoad = true) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldLoad || loaded) return;

    setLoading(true);

    const loadCSS = async () => {
      try {
        switch (cssType) {
          case 'carousel':
            await componentCssLoader.loadCarouselCSS();
            console.log('✅ CSS do carousel carregado dinamicamente');
            break;
          case 'gallery':
            await componentCssLoader.loadGalleryCSS();
            console.log('✅ CSS da galeria carregado dinamicamente');
            break;
          case 'animation':
            await componentCssLoader.loadAnimationCSS();
            console.log('✅ CSS de animações carregado dinamicamente');
            break;
          default:
            console.warn(`Tipo de CSS desconhecido: ${cssType}`);
        }
        setLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar CSS:', error);
        setLoaded(true); // Marca como carregado mesmo com erro
      } finally {
        setLoading(false);
      }
    };

    loadCSS();
  }, [cssType, shouldLoad, loaded]);

  return { loaded, loading };
};

export default componentCssLoader;