/**
 * Componentes lazy-loaded para otimização do primeiro paint
 * Aplica React.lazy/Suspense em componentes não essenciais
 */

import React, { Suspense } from 'react';

// Loading fallbacks otimizados
const SimpleSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: '20px',
    minHeight: '100px'
  }}>
    <div style={{
      width: '20px',
      height: '20px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #1A75FF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

const FooterFallback = () => (
  <div style={{ 
    height: '200px', 
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#6c757d'
  }}>
    Carregando...
  </div>
);

const SectionFallback = () => (
  <div style={{ 
    height: '300px', 
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#6c757d',
    margin: '20px 0'
  }}>
    Carregando seção...
  </div>
);

// ⚡ Lazy loading dos componentes não críticos
export const LazyFooter1 = React.lazy(() => 
  import('../homes/home-1/Footer1').catch(() => ({
    default: () => <FooterFallback />
  }))
);

export const LazyTestimonials = React.lazy(() => 
  import('../homes/home-1/Testimonials').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyBlogs = React.lazy(() => 
  import('../homes/home-1/Blogs').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyBrands = React.lazy(() => 
  import('../homes/home-1/Brands').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyAbout = React.lazy(() => 
  import('../homes/home-1/About').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyContactForm = React.lazy(() => 
  import('../common/ContactForm').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyFilterSidebar = React.lazy(() => 
  import('../common/FilterSidebar').catch(() => ({
    default: () => <SectionFallback />
  }))
);

export const LazyEstoqueSite = React.lazy(() => 
  import('../EstoqueSite').catch(() => ({
    default: () => <SectionFallback />
  }))
);

// Componentes wrapper com Suspense integrado
export const LazyFooter1WithSuspense = (props) => (
  <Suspense fallback={<FooterFallback />}>
    <LazyFooter1 {...props} />
  </Suspense>
);

export const LazyTestimonialsWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyTestimonials {...props} />
  </Suspense>
);

export const LazyBlogsWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyBlogs {...props} />
  </Suspense>
);

export const LazyBrandsWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyBrands {...props} />
  </Suspense>
);

export const LazyAboutWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyAbout {...props} />
  </Suspense>
);

export const LazyContactFormWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyContactForm {...props} />
  </Suspense>
);

export const LazyFilterSidebarWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyFilterSidebar {...props} />
  </Suspense>
);

export const LazyEstoqueSiteWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyEstoqueSite {...props} />
  </Suspense>
);

// Styles inline para o spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}