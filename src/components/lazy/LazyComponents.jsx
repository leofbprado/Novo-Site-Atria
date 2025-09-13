/**
 * Componentes lazy-loaded para otimização do primeiro paint.
 * Importa apenas caminhos válidos. Módulos ausentes usam fallback neutro,
 * evitando que o Vite quebre na análise de imports.
 */
import React, { Suspense } from "react";

/* ---------------- Fallbacks visuais leves ---------------- */
const SectionFallback = () => (
  <div
    style={{
      height: 180,
      backgroundColor: "#f8f9fa",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#6c757d",
      margin: "12px 0",
      fontSize: 14,
    }}
  >
    Carregando seção…
  </div>
);

const FooterFallback = () => (
  <div
    style={{
      height: 200,
      backgroundColor: "#f8f9fa",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#6c757d",
      fontSize: 14,
    }}
  >
    Carregando…
  </div>
);

/* Helper: normaliza default export e aplica fallback seguro */
const safeLazy = (importer) =>
  React.lazy(() =>
    importer()
      .then((m) => ({ default: m.default || m }))
      .catch(() => ({ default: SectionFallback }))
  );

/* ============================================================
   LAZY COMPONENTS — apenas caminhos válidos
   ============================================================ */

/* Footer (caminho correto) */
export const LazyFooter1 = safeLazy(() => import("../footers/Footer1"));

/* FilterSidebar (coluna/drawer) */
export const LazyFilterSidebar = safeLazy(() =>
  import("../common/FilterSidebar")
);

/* Seções Home v1 (estes existem no projeto) */
export const LazyTestimonials = safeLazy(() =>
  import("../homes/home-1/Testimonials")
);
export const LazyBlogs = safeLazy(() => import("../homes/home-1/Blogs"));
export const LazyBrands = safeLazy(() => import("../homes/home-1/Brands"));

/* ============================================================
   Módulos ausentes/duvidosos -> fallback neutro SEM import()
   ============================================================ */
export const LazyAbout = React.lazy(() =>
  Promise.resolve({ default: SectionFallback })
);
export const LazyContactForm = React.lazy(() =>
  Promise.resolve({ default: SectionFallback })
);
export const LazyEstoqueSite = React.lazy(() =>
  Promise.resolve({ default: SectionFallback })
);

/* ============================================================
   Wrappers com Suspense
   ============================================================ */
export const LazyFooter1WithSuspense = (props) => (
  <Suspense fallback={<FooterFallback />}>
    <LazyFooter1 {...props} />
  </Suspense>
);

export const LazyFilterSidebarWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyFilterSidebar {...props} />
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

export const LazyEstoqueSiteWithSuspense = (props) => (
  <Suspense fallback={<SectionFallback />}>
    <LazyEstoqueSite {...props} />
  </Suspense>
);

/* Pequena animação para alguns spinners */
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}
