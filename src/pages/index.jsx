import React, { Suspense, lazy } from "react";
import Header1 from "@/components/headers/Header1";
import Hero from "@/components/homes/home-1/Hero";
import Facts from "@/components/homes/home-1/Facts";
import Cars from "@/components/homes/home-1/Cars";
import Cta from "@/components/common/Cta";
import Features from "@/components/homes/home-1/Features";
import Features2 from "@/components/homes/home-1/Features2Simple";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";

// ⚡ LAZY LOADED COMPONENTS
const LazyFooter = lazy(() => import("@/components/footers/Footer1"));
const LazyBrands = lazy(() => import("@/components/homes/home-1/Brands"));
const LazyFinancingCalculator = lazy(() => import("@/components/homes/home-1/FinancingCalculator"));
const LazyTestimonials = lazy(() => import("@/components/homes/home-1/Testimonials"));
const LazyBlogs = lazy(() => import("@/components/homes/home-1/Blogs"));

// Loader padrão
const ComponentLoader = ({ message = "Carregando..." }) => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border text-primary me-3" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
    <span className="text-muted">{message}</span>
  </div>
);

// ============ Error Boundary por seção ============
class SectionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error(`💥 Erro na seção "${this.props.name}":`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, border: "1px solid #fee", background: "#fff6f6", borderRadius: 8, margin: "16px 0" }}>
          <strong style={{ color: "#b00020" }}>Seção com erro:</strong> {this.props.name}
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Section = ({ name, children }) => (
  <SectionBoundary name={name}>{children}</SectionBoundary>
);

// ============ Página ============
export default function HomePage1() {
  return (
    <>
      {/* CRITICAL PATH */}
      <Section name="Header1">
        <Header1 />
      </Section>

      <Section name="Hero">
        <Hero />
      </Section>

      <Section name="Facts">
        <Facts />
      </Section>

      <Section name="Brands">
        <Suspense fallback={<ComponentLoader message="Carregando marcas..." />}>
          <LazyBrands />
        </Suspense>
      </Section>

      <Section name="FinancingCalculator">
        <Suspense fallback={<ComponentLoader message="Carregando calculadora..." />}>
          <LazyFinancingCalculator />
        </Suspense>
      </Section>

      <Section name="Cars">
        <Cars />
      </Section>

      <Section name="Cta">
        <Cta />
      </Section>

      <Section name="Features">
        <Features />
      </Section>

      <Section name="Features2">
        <Features2 />
      </Section>

      <Section name="Testimonials">
        <Suspense fallback={<ComponentLoader message="Carregando depoimentos..." />}>
          <LazyTestimonials />
        </Suspense>
      </Section>

      <Section name="Blogs">
        <Suspense fallback={<ComponentLoader message="Carregando blog..." />}>
          <LazyBlogs />
        </Suspense>
      </Section>

      <Section name="Footer">
        <Suspense fallback={<ComponentLoader message="Carregando rodapé..." />}>
          <LazyFooter />
        </Suspense>
      </Section>

      <Section name="FixedBottomMenu">
        <FixedBottomMenu />
      </Section>
    </>
  );
}
