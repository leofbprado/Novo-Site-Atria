import { Suspense, lazy } from 'react';
import Header1 from "@/components/headers/Header1";
import Hero from "@/components/homes/home-1/Hero";
import Facts from "@/components/homes/home-1/Facts";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import StaticSEO from "@/components/seo/StaticSEO";

// ⚡ Lazy loaded components - Code-split para melhor performance
// Componentes abaixo da dobra carregados apenas quando necessário
const Cars = lazy(() => import("@/components/homes/home-1/Cars"));
const Cta = lazy(() => import("@/components/common/Cta"));
const Features = lazy(() => import("@/components/homes/home-1/Features"));
const Features2 = lazy(() => import("@/components/homes/home-1/Features2Simple"));
const FinancingCalculator = lazy(() => import("@/components/homes/home-1/FinancingCalculator"));
const Footer1 = lazy(() => import("@/components/footers/Footer1"));
const Blogs = lazy(() => import("@/components/homes/home-1/Blogs"));
const Brands = lazy(() => import("@/components/homes/home-1/Brands"));
const Testimonials = lazy(() => import("@/components/homes/home-1/Testimonials"));

export default function HomePage1() {
  return (
    <>
      <StaticSEO page="home" />
      {/* Componentes críticos acima da dobra - carregados imediatamente */}
      <Header1 />
      <Hero />
      <Facts />
      
      {/* Componentes abaixo da dobra - lazy loaded com Suspense */}
      <Suspense fallback={<div style={{ height: 200 }} />}>
        <Brands />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 400 }} />}>
        <FinancingCalculator />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 600 }} />}>
        <Cars />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 150 }} />}>
        <Cta />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 300 }} />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 300 }} />}>
        <Features2 />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 400 }} />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 500 }} />}>
        <Blogs />
      </Suspense>
      
      <Suspense fallback={<div style={{ height: 300 }} />}>
        <Footer1 />
      </Suspense>
      
      <FixedBottomMenu />
    </>
  );
}
