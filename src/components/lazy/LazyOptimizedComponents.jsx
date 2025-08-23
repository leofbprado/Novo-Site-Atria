// ⚡ LAZY OPTIMIZED COMPONENTS - Major JavaScript Bundle Reduction
import { lazy, Suspense, memo, useState, useEffect, useRef } from 'react';

// Loading component optimized for different contexts
const OptimizedLoader = memo(({ 
  size = 'medium', 
  message = 'Carregando...', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        aria-label="Carregando"
      />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
});

// ⚡ NON-CRITICAL COMPONENTS (Defer loading)
export const LazyFooter = lazy(() => {
  console.log('🔄 Carregando Footer...');
  return import('../footers/Footer1').then(module => {
    console.log('✅ Footer carregado');
    return module;
  });
});

export const LazyTestimonials = lazy(() => {
  console.log('🔄 Carregando Testimonials...');
  return import('../homes/home-1/Testimonials').then(module => {
    console.log('✅ Testimonials carregado');
    return module;
  });
});

export const LazyBrands = lazy(() => {
  console.log('🔄 Carregando Brands...');
  return import('../homes/home-1/Brands').then(module => {
    console.log('✅ Brands carregado');
    return module;
  });
});

export const LazyBlogs = lazy(() => {
  console.log('🔄 Carregando Blogs...');
  return import('../homes/home-1/Blogs').then(module => {
    console.log('✅ Blogs carregado');
    return module;
  });
});

export const LazyVideoOfTheWeek = lazy(() => {
  console.log('🔄 Carregando VideoOfTheWeek...');
  return import('../homes/home-1/VideoOfTheWeek').then(module => {
    console.log('✅ VideoOfTheWeek carregado');
    return module;
  });
});

// ⚡ HEAVY VENDOR COMPONENTS (Load on demand)
export const LazyChartComponents = lazy(() => {
  console.log('🔄 Carregando Chart.js...');
  return Promise.all([
    import('chart.js/auto'),
    import('react-chartjs-2')
  ]).then(([chartJS, reactChartJS]) => {
    console.log('✅ Chart.js carregado');
    return {
      default: reactChartJS.Chart
    };
  });
});

export const LazyPhotoSwipe = lazy(() => {
  console.log('🔄 Carregando PhotoSwipe...');
  return import('react-photoswipe-gallery').then(module => {
    console.log('✅ PhotoSwipe carregado');
    return module;
  });
});

export const LazyMapComponent = lazy(() => {
  console.log('🔄 Carregando Google Maps...');
  return import('@react-google-maps/api').then(module => {
    console.log('✅ Google Maps carregado');
    return { default: module.GoogleMap };
  });
});

// ⚡ ADMIN COMPONENTS (Load only when needed)
export const LazyAdminPage = lazy(() => {
  console.log('🔄 Carregando Admin Panel...');
  return import('../../pages/admin/AdminPage').then(module => {
    console.log('✅ Admin Panel carregado');
    return module;
  });
});

export const LazyFinancingCalculator = lazy(() => {
  console.log('🔄 Carregando Calculadora...');
  return import('../homes/home-1/FinancingCalculator').then(module => {
    console.log('✅ Calculadora carregada');
    return module;
  });
});

// ⚡ UTILITY WRAPPER COMPONENT
export const LazyWrapper = memo(({ 
  children, 
  fallback,
  errorBoundary = true,
  className = '',
  minHeight = '200px'
}) => {
  const defaultFallback = (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight }}
    >
      <OptimizedLoader />
    </div>
  );

  const suspenseWrapper = (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );

  if (errorBoundary) {
    return (
      <div className={className}>
        {suspenseWrapper}
      </div>
    );
  }

  return suspenseWrapper;
});

// ⚡ INTERSECTION OBSERVER LAZY LOADER
export const IntersectionLazy = memo(({ 
  children, 
  className = '',
  rootMargin = '50px',
  threshold = 0.1,
  fallback = null
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded, rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  );
});

// ⚡ PERFORMANCE TRACKING
export const withLazyTracking = (WrappedComponent, componentName) => {
  return memo((props) => {
    useEffect(() => {
      if (window.ATRIA_PERF) {
        window.ATRIA_PERF.mark(`Lazy Component Rendered: ${componentName}`);
      }
    }, []);

    return <WrappedComponent {...props} />;
  });
};

// Export default loader
export default OptimizedLoader;