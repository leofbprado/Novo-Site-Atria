// ⚡ CONDITIONAL CSS LOADER - Load CSS only when needed
const loadedCSS = new Set();

/**
 * Load CSS conditionally based on page/component requirements
 */
export const loadConditionalCSS = (cssId, href, condition = true) => {
  if (!condition || loadedCSS.has(cssId)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = cssId;
    
    link.onload = () => {
      loadedCSS.add(cssId);
      console.log(`✅ CSS condicional carregado: ${cssId}`);
      resolve();
    };
    
    link.onerror = () => {
      console.warn(`⚠️ Erro ao carregar CSS: ${cssId}`);
      reject(new Error(`Failed to load CSS: ${cssId}`));
    };
    
    document.head.appendChild(link);
  });
};

/**
 * Gallery CSS - Only load on inventory/gallery pages
 */
export const loadGalleryCSS = () => {
  const isGalleryPage = window.location.pathname.includes('/estoque') || 
                       window.location.pathname.includes('/inventory') ||
                       window.location.pathname.includes('/veiculo');
  
  if (!isGalleryPage) return Promise.resolve();
  
  return Promise.all([
    loadConditionalCSS(
      'photoswipe-css',
      'https://cdn.jsdelivr.net/npm/photoswipe@5.3.4/dist/photoswipe.css',
      true
    ),
    loadConditionalCSS(
      'gallery-lightbox-css',
      'https://cdn.jsdelivr.net/npm/react-photoswipe-gallery@2.2.2/dist/index.css',
      true
    )
  ]);
};

/**
 * Carousel CSS - Only load when carousels are present
 */
export const loadCarouselCSS = () => {
  const hasCarousel = document.querySelector('.slick-slider') || 
                     document.querySelector('[data-slick]') ||
                     document.querySelector('.carousel');
  
  if (!hasCarousel) return Promise.resolve();
  
  return Promise.all([
    loadConditionalCSS(
      'slick-css',
      'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css',
      true
    ),
    loadConditionalCSS(
      'slick-theme-css',
      'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css',
      true
    )
  ]);
};

/**
 * Chart CSS - Only load on admin/dashboard pages
 */
export const loadChartCSS = () => {
  const isAdminPage = window.location.pathname.includes('/admin') ||
                     window.location.pathname.includes('/dashboard');
  
  if (!isAdminPage) return Promise.resolve();
  
  return loadConditionalCSS(
    'chart-css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.css',
    true
  );
};

/**
 * Initialize conditional CSS loading based on page
 */
export const initConditionalCSS = () => {
  // Load immediately if elements are already present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        loadGalleryCSS();
        loadCarouselCSS();
        loadChartCSS();
      }, 100);
    });
  } else {
    setTimeout(() => {
      loadGalleryCSS();
      loadCarouselCSS();
      loadChartCSS();
    }, 100);
  }
  
  // Also load on route changes (for SPA)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  const checkConditionalCSS = () => {
    setTimeout(() => {
      loadGalleryCSS();
      loadCarouselCSS();  
      loadChartCSS();
    }, 200);
  };
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    checkConditionalCSS();
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    checkConditionalCSS();
  };
  
  window.addEventListener('popstate', checkConditionalCSS);
};

/**
 * Preload critical gallery CSS on user intent
 */
export const preloadGalleryOnIntent = () => {
  const inventoryLinks = document.querySelectorAll('a[href*="estoque"], a[href*="inventory"], a[href*="veiculo"]');
  
  const preloadHandler = () => {
    loadGalleryCSS();
    // Remove listeners after first trigger
    inventoryLinks.forEach(link => {
      link.removeEventListener('mouseenter', preloadHandler);
      link.removeEventListener('focus', preloadHandler);
    });
  };
  
  inventoryLinks.forEach(link => {
    link.addEventListener('mouseenter', preloadHandler, { passive: true, once: true });
    link.addEventListener('focus', preloadHandler, { passive: true, once: true });
  });
};

export default {
  loadConditionalCSS,
  loadGalleryCSS,
  loadCarouselCSS,
  loadChartCSS,
  initConditionalCSS,
  preloadGalleryOnIntent
};