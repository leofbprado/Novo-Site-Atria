// ⚡ LAZY IMPORT UTILITIES - Reduces initial bundle size
import { lazy } from 'react';

// Critical path components (load immediately)
// These are already imported normally in their respective files

// Non-critical components (lazy load)
export const LazyFooter = lazy(() => import('../components/footers/Footer1'));
export const LazyNavigation = lazy(() => import('../components/headers/Header1'));
export const LazyTestimonials = lazy(() => import('../components/homes/testimonials/Testimonials'));
export const LazyBrands = lazy(() => import('../components/homes/brands/Brands'));
export const LazyBlogSection = lazy(() => import('../components/homes/blogs/Blogs'));
export const LazyFAQSection = lazy(() => import('../components/homes/faq/FAQ'));

// Heavy vendor libraries (defer loading)
export const loadChartJS = () => import('chart.js/auto');
export const loadPhotoSwipe = () => import('photoswipe');
export const loadReactChartJS = () => import('react-chartjs-2');

// Firebase modules (load on demand)
export const loadFirebaseAuth = () => import('firebase/auth');
export const loadFirebaseStorage = () => import('firebase/storage');
export const loadFirebaseAnalytics = () => import('firebase/analytics');

// Utility functions for dynamic loading
export const createLazyComponent = (importFn, fallback = null) => {
  return lazy(() => importFn().catch(err => {
    console.warn('⚠️ Erro ao carregar componente lazy:', err);
    return { default: () => fallback || <div>Erro ao carregar componente</div> };
  }));
};

// Performance tracking for lazy loads
export const trackLazyLoad = (componentName) => {
  if (window.ATRIA_PERF) {
    window.ATRIA_PERF.mark(`Lazy Load: ${componentName}`);
    console.log(`⚡ Componente lazy carregado: ${componentName}`);
  }
};

// Dynamic CSS loading
export const loadCSS = (href, id = null) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;
    
    link.onload = () => {
      console.log(`✅ CSS carregado: ${href}`);
      resolve();
    };
    
    link.onerror = () => {
      console.warn(`⚠️ Erro ao carregar CSS: ${href}`);
      reject(new Error(`Failed to load CSS: ${href}`));
    };
    
    document.head.appendChild(link);
  });
};

// Dynamic script loading
export const loadScript = (src, id = null) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (id) script.id = id;
    
    script.onload = () => {
      console.log(`✅ Script carregado: ${src}`);
      resolve();
    };
    
    script.onerror = () => {
      console.warn(`⚠️ Erro ao carregar script: ${src}`);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
};

// Intersection Observer for lazy loading on scroll
export const createScrollLazyLoader = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };
  
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    }, defaultOptions);
  }
  
  // Fallback for browsers without IntersectionObserver
  return {
    observe: (element) => {
      setTimeout(() => callback(element), 1000);
    },
    unobserve: () => {},
    disconnect: () => {}
  };
};

// Bundle size optimization helpers
export const getBundleInfo = () => {
  if (import.meta.env.DEV) {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
  return null;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    'https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHQ.woff2',
    'https://fonts.gstatic.com/s/dmsans/v11/rP2Cp2ywxg089UriAWCrCBimCw.woff2',
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_1920/v1/atria-veiculos/images/hero/hero-background-atria'
  ];
  
  criticalResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = href.includes('.woff2') ? 'font' : 'image';
    link.href = href;
    if (href.includes('.woff2')) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
  
  console.log('✅ Recursos críticos preloaded:', criticalResources.length);
};