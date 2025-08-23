import React, { Suspense, lazy } from 'react';

// HOC para carregamento lazy de componentes pesados
export const createLazyComponent = (importFunc, fallback = <div>Carregando...</div>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Componentes lazy específicos
export const LazyChart = createLazyComponent(
  () => import('@/components/common/Charts'),
  <div className="flex items-center justify-center h-48">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export const LazyAccordion = createLazyComponent(
  () => import('@/components/common/Accordion'),
  <div className="bg-gray-100 animate-pulse h-32 rounded-lg"></div>
);

export const LazyMap = createLazyComponent(
  () => import('@/components/common/GoogleMap'),
  <div className="bg-gray-200 animate-pulse h-64 rounded-lg flex items-center justify-center">
    <span className="text-gray-500">Carregando mapa...</span>
  </div>
);

// Wrapper para carregamento condicional baseado em visibilidade
export const LazyOnVisible = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>}
    </div>
  );
};