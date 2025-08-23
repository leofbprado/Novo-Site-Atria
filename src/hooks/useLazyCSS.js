/**
 * Hook personalizado para carregamento lazy de CSS
 * Optimizado para performance e carregamento condicional
 */
import { useState, useEffect } from 'react';

const loadedCSS = new Set();
const loadingPromises = new Map();

export const useLazyCSS = (cssFiles, componentName) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loaded) return;

    setLoading(true);
    
    const loadCSS = async () => {
      try {
        const promises = cssFiles.map(file => {
          const id = file.replace(/[^a-zA-Z0-9]/g, '-');
          
          // Se já foi carregado, pula
          if (loadedCSS.has(id) || document.getElementById(id)) {
            return Promise.resolve();
          }

          // Se já está carregando, retorna a promise existente
          if (loadingPromises.has(id)) {
            return loadingPromises.get(id);
          }

          const promise = new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = file;
            link.id = id;
            
            link.onload = () => {
              loadedCSS.add(id);
              loadingPromises.delete(id);
              resolve();
            };
            
            link.onerror = () => {
              loadingPromises.delete(id);
              resolve(); // Continue mesmo com erro
            };

            document.head.appendChild(link);
          });

          loadingPromises.set(id, promise);
          return promise;
        });

        await Promise.allSettled(promises);
        console.log(`✅ CSS carregado para ${componentName}:`, cssFiles);
        setLoaded(true);
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar CSS para ${componentName}:`, error);
        setLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadCSS();
  }, [cssFiles, componentName, loaded]);

  return { loaded, loading };
};

// Hook específico para carousels
export const useCarouselCSS = () => {
  return useLazyCSS([
    '/css/slick.css',
    '/css/slick-theme.css'
  ], 'carousel');
};

// Hook específico para animações
export const useAnimationCSS = () => {
  return useLazyCSS([
    '/css/animate.css'
  ], 'animations');
};

// Hook específico para galerias
export const useGalleryCSS = () => {
  return useLazyCSS([
    '/css/jquery.fancybox.min.css'
  ], 'gallery');
};

export default useLazyCSS;