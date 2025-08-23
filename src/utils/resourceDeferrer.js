// ⚡ RESOURCE DEFERRER - Delay non-critical resources until after page load
export class ResourceDeferrer {
  constructor() {
    this.loadedResources = new Set();
    this.observers = new Map();
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDeferredLoading());
    } else {
      this.setupDeferredLoading();
    }
  }

  setupDeferredLoading() {
    // Defer all images with loading="lazy"
    this.setupLazyImages();
    
    // Setup gallery CSS loading on inventory page intent
    this.setupGalleryCSSPreload();
    
    // Setup conditional script loading
    this.setupConditionalScripts();
    
    console.log('✅ Resource deferrer initialized');
  }

  /**
   * Setup lazy loading for all images below the fold
   */
  setupLazyImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Add fade-in animation
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '0';
            
            img.onload = () => {
              img.style.opacity = '1';
              console.log(`✅ Lazy image loaded: ${img.alt || img.src}`);
            };
            
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      images.forEach(img => {
        if (!img.complete) {
          imageObserver.observe(img);
        }
      });
    }
  }

  /**
   * Preload gallery CSS when user hovers over inventory links
   */
  setupGalleryCSSPreload() {
    const inventoryLinks = document.querySelectorAll('a[href*="estoque"], a[href*="inventory"], a[href*="veiculo"]');
    
    const preloadGalleryCSS = () => {
      if (!this.loadedResources.has('gallery-css')) {
        this.loadGalleryResources();
        this.loadedResources.add('gallery-css');
      }
    };

    inventoryLinks.forEach(link => {
      link.addEventListener('mouseenter', preloadGalleryCSS, { passive: true, once: true });
      link.addEventListener('focus', preloadGalleryCSS, { passive: true, once: true });
    });
  }

  /**
   * Load gallery-specific CSS and JS only when needed
   */
  async loadGalleryResources() {
    const resources = [
      {
        type: 'css',
        href: 'https://cdn.jsdelivr.net/npm/photoswipe@5.3.4/dist/photoswipe.css',
        id: 'photoswipe-css'
      },
      {
        type: 'css', 
        href: 'https://cdn.jsdelivr.net/npm/react-photoswipe-gallery@2.2.2/dist/index.css',
        id: 'gallery-lightbox-css'
      }
    ];

    for (const resource of resources) {
      if (resource.type === 'css') {
        await this.loadCSS(resource.href, resource.id);
      }
    }

    console.log('✅ Gallery resources preloaded');
  }

  /**
   * Load CSS asynchronously
   */
  loadCSS(href, id) {
    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(id)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;
      
      link.onload = () => {
        this.loadedResources.add(id);
        console.log(`✅ CSS loaded: ${id}`);
        resolve();
      };
      
      link.onerror = () => {
        console.warn(`⚠️ Failed to load CSS: ${id}`);
        reject(new Error(`Failed to load CSS: ${id}`));
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Setup conditional script loading based on page context
   */
  setupConditionalScripts() {
    // Load chart.js only on admin pages
    if (window.location.pathname.includes('/admin')) {
      this.loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js', 'chart-js');
    }

    // Load slick carousel only when carousel elements are present
    const checkForCarousels = () => {
      const carousels = document.querySelectorAll('.slick-slider, [data-slick]');
      if (carousels.length > 0 && !this.loadedResources.has('slick-js')) {
        this.loadSlickCarousel();
      }
    };

    // Check immediately and on DOM mutations
    checkForCarousels();
    
    const observer = new MutationObserver(checkForCarousels);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Load slick carousel resources
   */
  async loadSlickCarousel() {
    if (this.loadedResources.has('slick-js')) return;

    await Promise.all([
      this.loadCSS('https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css', 'slick-css'),
      this.loadCSS('https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css', 'slick-theme-css'),
      this.loadScript('https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js', 'slick-js')
    ]);

    console.log('✅ Slick carousel loaded');
  }

  /**
   * Load JavaScript asynchronously
   */
  loadScript(src, id) {
    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(id)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.id = id;
      
      script.onload = () => {
        this.loadedResources.add(id);
        console.log(`✅ Script loaded: ${id}`);
        resolve();
      };
      
      script.onerror = () => {
        console.warn(`⚠️ Failed to load script: ${id}`);
        reject(new Error(`Failed to load script: ${id}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Add loading="lazy" to all images that don't have it
   */
  addLazyLoadingToAllImages() {
    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach((img, index) => {
      // Skip images in the hero section (above the fold)
      const isAboveFold = img.closest('.boxcar-banner-section-v1') || 
                         img.closest('.hero-section') ||
                         index < 3; // First 3 images are usually above fold
      
      if (!isAboveFold) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        console.log(`✅ Added lazy loading to image: ${img.alt || img.src}`);
      }
    });
  }

  /**
   * Monitor performance and log improvements
   */
  trackPerformanceImprovements() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        const metrics = {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          deferredResources: this.loadedResources.size
        };

        console.log('📊 Resource Deferrer Performance:', {
          'DOM Content Loaded': `${metrics.domContentLoaded?.toFixed(2)}ms`,
          'First Paint': `${metrics.firstPaint.toFixed(2)}ms`,
          'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(2)}ms`,
          'Deferred Resources': metrics.deferredResources
        });

        // Track in global performance object
        if (window.ATRIA_PERF) {
          window.ATRIA_PERF.resourceDeferrer = metrics;
        }
      }, 1000);
    });
  }
}

// Initialize the resource deferrer
export const resourceDeferrer = new ResourceDeferrer();

// Auto-add lazy loading to images
document.addEventListener('DOMContentLoaded', () => {
  resourceDeferrer.addLazyLoadingToAllImages();
  resourceDeferrer.trackPerformanceImprovements();
});

export default resourceDeferrer;