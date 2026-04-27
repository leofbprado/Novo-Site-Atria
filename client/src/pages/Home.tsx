import { lazy, Suspense } from "react";
import { useSEO } from "@/hooks/useSEO";
import { HeroSection } from "@/components/home/HeroSection";

// Tudo abaixo da fold (Simulador, BrandCarousel, EstoqueDestaque, Depoimentos,
// FAQ, Contato, etc.) carrega em chunk separado pra não inflar o index.js
// inicial e arrasar o LCP/INP. Usuário vê o hero imediatamente; o resto
// streams enquanto ele lê.
const HomeBody = lazy(() => import("@/pages/HomeBody"));

export default function Home() {
  useSEO({
    title: "Átria Veículos | Carros Seminovos e Usados em Campinas SP",
    description: "Átria Veículos: concessionária de seminovos em Campinas-SP com mais de 12 anos de mercado e +10.000 carros vendidos. Mais de 200 veículos, 3 lojas e financiamento facilitado. BMW, Mercedes, Audi, Toyota e mais.",
    path: "/",
  });

  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <HomeBody />
      </Suspense>
    </>
  );
}
