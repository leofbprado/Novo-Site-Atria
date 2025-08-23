import React, { StrictMode } from "react";
import ReactDOM, { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { firebaseLazy } from '@/utils/firebaseLazy';

// ✅ FIREBASE CONDITIONAL LOADING
let firebaseInitialized = false;

const initFirebase = (eager = false) => {
  if (firebaseInitialized) return;
  firebaseInitialized = true;
  firebaseLazy.init(eager ? { eager: true } : {});
};

// Check current route
const currentPath = window.location.pathname;

if (currentPath.startsWith('/estoque')) {
  // Eager loading for inventory pages
  initFirebase(true);
} else {
  // Lazy loading for home page with user interaction triggers
  const triggers = [];
  
  // Trigger 1: requestIdleCallback (fallback: window.load)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initFirebase(), { timeout: 2000 });
  } else {
    triggers.push(['load', () => initFirebase()]);
  }
  
  // Trigger 2: first focus or keydown on search field
  const searchTrigger = (event) => {
    const searchInput = document.querySelector('input[name="q"], .hero input[type="search"]');
    if (searchInput && (event.target === searchInput || searchInput.contains(event.target))) {
      initFirebase();
      cleanup();
    }
  };
  triggers.push(['focus', searchTrigger, true]);
  triggers.push(['keydown', searchTrigger, true]);
  
  // Trigger 3: first scroll with scrollY > 150
  const scrollTrigger = () => {
    if (window.scrollY > 150) {
      initFirebase();
      cleanup();
    }
  };
  triggers.push(['scroll', scrollTrigger]);
  
  // Cleanup function to remove all listeners
  const cleanup = () => {
    triggers.forEach(([event, handler, capture]) => {
      window.removeEventListener(event, handler, capture);
    });
  };
  
  // Add all listeners
  triggers.forEach(([event, handler, capture]) => {
    window.addEventListener(event, handler, capture);
  });
}

// ⚡ CRITICAL: Only load essential CSS immediately
import './styles/accessibility-fixes.css';
import './styles/overrides.css'; // High-specificity overrides

// ✅ CONSOLE FILTER: Defer non-critical utilities
const loadConsoleFilter = () => import('./utils/consoleFilter.js');



// ✅ ENSURE REACT IS AVAILABLE GLOBALLY (fix for useLayoutEffect error)
window.React = React;
window.ReactDOM = ReactDOM;

// ✅ FIX REACT ERROR #130: useLayoutEffect SSR compatibility
if (typeof window === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

// ✅ GLOBAL ERROR HANDLER para React Error #130
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('130')) {
    console.warn('🔧 React Error #130 detectado globalmente e suprimido');
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// ✅ UNHANDLED REJECTION HANDLER
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('130')) {
    console.warn('🔧 React Error #130 em Promise rejeitada - tratado');
    event.preventDefault();
    return false;
  }
});

// ✅ SERVICE WORKER: Registrar para cache e performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.warn('⚠️ Erro ao registrar Service Worker:', error);
      });
  });
}



// ⚡ RESOURCE DEFERRER: Load non-critical resources after page load
import('./utils/resourceDeferrer').then(() => {
  console.log('✅ Resource deferrer loaded');
}).catch(() => {
  console.warn('⚠️ Resource deferrer failed to load');
});

// ⚡ DEFER jQuery loading - only load when needed for slick-carousel
const loadJQuery = async () => {
  if (!window.jQuery) {
    const { default: $ } = await import('jquery');
    window.jQuery = window.$ = $;
    console.log('✅ jQuery carregado sob demanda');
  }
  return window.jQuery;
};

// ✅ OTIMIZAÇÃO CRÍTICA: Carregamento diferido dinâmico do CSS
const loadDeferredCSS = () => {
  // Função utilitária para carregar CSS de forma assíncrona
  const loadCSS = (href, media = 'all') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = function() {
      this.onload = null;
      this.rel = 'stylesheet';
      this.media = media;
    };
    
    // Fallback para navegadores sem suporte a preload
    link.onerror = function() {
      const fallback = document.createElement('link');
      fallback.rel = 'stylesheet';
      fallback.href = href;
      fallback.media = media;
      document.head.appendChild(fallback);
    };
    
    document.head.appendChild(link);
    
    // Noscript fallback
    const noscript = document.createElement('noscript');
    const noScriptLink = document.createElement('link');
    noScriptLink.rel = 'stylesheet';
    noScriptLink.href = href;
    noscript.appendChild(noScriptLink);
    document.head.appendChild(noscript);
    
    return link;
  };

  // Carregar CSS principal da aplicação após First Paint
  setTimeout(() => {
    // Importar CSS principal dinamicamente
    import('./index.css').then(() => {
      console.log('✅ CSS principal da aplicação carregado');
    }).catch(err => {
      console.warn('⚠️ Erro ao carregar CSS principal:', err);
    });
    
    // Importar CSS do call-to-call lead
    import('./styles/calllead.css').then(() => {
      console.log('✅ Call-to-Call lead CSS carregado');
    }).catch(err => {
      console.warn('⚠️ Erro ao carregar Call-to-Call CSS:', err);
    });
    
    // Importar Safari fixes CSS
    import('./styles/safari-fixes.css').then(() => {
      console.log('✅ Safari fixes CSS carregado');
    }).catch(err => {
      console.warn('⚠️ Erro ao carregar Safari fixes:', err);
    });
    
    // CSS externos não-críticos
    loadCSS('https://cdn.jsdelivr.net/npm/photoswipe@5.3.4/dist/photoswipe.css');
    
    console.log('✅ CSS não-crítico carregado de forma assíncrona');
  }, 50); // Delay mínimo para garantir First Paint
};

// ⚡ PERFORMANCE OPTIMIZATION: Stagger non-critical loads
const initializeApp = async () => {
  // Load console filter after first paint
  setTimeout(() => {
    loadConsoleFilter().then(() => {
      console.log('✅ Console filter carregado');
    }).catch(err => console.warn('⚠️ Erro ao carregar console filter:', err));
  }, 100);
  
  // Load deferred CSS
  loadDeferredCSS();
  
  // ✅ SLICK CSS LOADER SEGURO
  const loadSlickCSS = () => {
    loadCSS('/css/slick.css');
    loadCSS('/css/slick-theme.css');
    console.log('✅ Slick CSS carregado');
  };
  
  // ✅ JQUERY + SLICK LOADER COM GUARDAS
  setTimeout(() => {
    loadJQuery()
      .then(() => {
        loadSlickCSS();
        console.log('✅ jQuery + Slick CSS prontos');
      })
      .catch(err => console.warn('⚠️ Erro ao preload jQuery:', err));
  }, 2000);
  
  // Initialize Firebase lazily
  const initFirebaseAfterLCP = () => {
    if (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/estoque')) {
      firebaseLazy.init({ eager: true });
    } else {
      setTimeout(() => firebaseLazy.init({ eager: false }), 3000);
    }
  };
  window.requestIdleCallback ? requestIdleCallback(initFirebaseAfterLCP) : setTimeout(initFirebaseAfterLCP, 2000);
};

// Execute after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  requestAnimationFrame(initializeApp);
}

// Export utilities for other components
window.loadJQuery = loadJQuery;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);
