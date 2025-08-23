import React, { Suspense, lazy } from 'react';
import Header1 from "@/components/headers/Header1";
import Hero from "@/components/homes/home-1/Hero";
import Facts from "@/components/homes/home-1/Facts";
import Cars from "@/components/homes/home-1/Cars";
import Cta from "@/components/common/Cta";
import Features from "@/components/homes/home-1/Features";
import Features2 from "@/components/homes/home-1/Features2Simple";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";

// ⚡ LAZY LOADED COMPONENTS - Reduces initial bundle by ~85KB
const LazyFooter = lazy(() => import("@/components/footers/Footer1"));
const LazyBrands = lazy(() => import("@/components/homes/home-1/Brands"));
const LazyFinancingCalculator = lazy(() => import("@/components/homes/home-1/FinancingCalculator"));
const LazyTestimonials = lazy(() => import("@/components/homes/home-1/Testimonials"));
const LazyBlogs = lazy(() => import("@/components/homes/home-1/Blogs"));

// Optimized loading component
const ComponentLoader = ({ message = "Carregando..." }) => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border text-primary me-3" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
    <span className="text-muted">{message}</span>
  </div>
);

export default function HomePage1() {
  return (
    <>
      {/* ⚡ CRITICAL PATH - Load immediately */}
      <Header1 />
      <Hero />
      <Facts />
      
      {/* ⚡ SEÇÕES APÓS FACTS - Ordem correta */}
      <Suspense fallback={<ComponentLoader message="Carregando marcas..." />}>
        <LazyBrands />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader message="Carregando calculadora..." />}>
        <LazyFinancingCalculator />
      </Suspense>
      
      <Cars />
      <Cta />
      <Features />
      <Features2 />
      
      <Suspense fallback={<ComponentLoader message="Carregando depoimentos..." />}>
        <LazyTestimonials />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader message="Carregando blog..." />}>
        <LazyBlogs />
      </Suspense>
      
      <Suspense fallback={<ComponentLoader message="Carregando rodapé..." />}>
        <LazyFooter />
      </Suspense>
      
      <FixedBottomMenu />
    </>
  );
}
