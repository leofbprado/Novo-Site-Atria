// Performance Optimizations Utilities
// Funções para otimizar performance do site

// 1. Intersection Observer para lazy loading avançado
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// 2. Debounce para filtros e busca
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// 3. Preload de recursos críticos
export const preloadCriticalResources = () => {
  const criticalImages = [
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    'https://res.cloudinary.com/dyngqkiyl/video/upload/so_1.5,w_800,q_80,f_webp/v1754333277/WhatsApp_Video_2025-08-04_at_15.46.21_c4vue5.jpg'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// 4. Otimização de imagens
export const optimizeImageLoading = (imgElement) => {
  if (!imgElement) return;
  
  // Adicionar loading lazy se não tiver
  if (!imgElement.hasAttribute('loading')) {
    imgElement.setAttribute('loading', 'lazy');
  }
  
  // Adicionar decoding async se não tiver
  if (!imgElement.hasAttribute('decoding')) {
    imgElement.setAttribute('decoding', 'async');
  }
  
  // Handler de erro para fallback
  imgElement.onerror = () => {
    console.warn('Erro ao carregar imagem:', imgElement.src);
    imgElement.style.display = 'none';
  };
  
  // Log de sucesso no carregamento
  imgElement.onload = () => {
    console.log('✅ Imagem carregada com sucesso:', imgElement.src);
  };
};

// 5. Bundle splitting dinâmico
export const loadModuleDynamically = async (modulePath) => {
  try {
    const module = await import(modulePath);
    return module.default || module;
  } catch (error) {
    console.error('Erro ao carregar módulo:', modulePath, error);
    return null;
  }
};

// 6. Service Worker para cache inteligente
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration);
      })
      .catch(error => {
        console.warn('⚠️ Falha ao registrar Service Worker:', error);
      });
  }
};

// 7. Cleanup de listeners e recursos
export const createCleanupHelper = () => {
  const cleanupTasks = [];
  
  const addCleanup = (task) => {
    cleanupTasks.push(task);
  };
  
  const cleanup = () => {
    cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Erro durante cleanup:', error);
      }
    });
    cleanupTasks.length = 0;
  };
  
  return { addCleanup, cleanup };
};

// 8. Monitor de performance
export const performanceMonitor = {
  startTime: Date.now(),
  
  mark: (name) => {
    if (performance?.mark) {
      performance.mark(name);
    }
    console.log(`📊 Performance mark: ${name} at ${Date.now() - performanceMonitor.startTime}ms`);
  },
  
  measure: (name, startMark, endMark) => {
    if (performance?.measure) {
      performance.measure(name, startMark, endMark);
    }
  },
  
  getMetrics: () => {
    if (performance?.getEntriesByType) {
      return {
        navigation: performance.getEntriesByType('navigation')[0],
        paint: performance.getEntriesByType('paint'),
        marks: performance.getEntriesByType('mark')
      };
    }
    return null;
  }
};