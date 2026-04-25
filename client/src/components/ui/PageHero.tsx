import { motion } from "framer-motion";
import type { ReactNode } from "react";

// PageHero — única fonte de verdade pro hero h1 de páginas internas
// (Estoque, Sobre, Financiamento, Blog, etc). Pareia com <SectionHeader/>
// (h2 de seção) pro design system de tipografia/hierarquia ficar fechado.
//
// Anatomia (top→bottom):
//   eyebrow (amarelo, opcional) → h1 (branco uppercase) → subtítulo
//   (white/70, opcional) → children (botões/CTA, opcional)
//
// Bg navy sólido + entry animation padrão (fade+up). Centralizado.
//
// Quando usar h1 raw em vez deste componente: páginas com hero muito
// específico (ex: VendaSeuCarro com CTA buttons embutidos + max-w-3xl
// custom). Pra heros de "topo institucional" usar este componente.

interface Props {
  /** Eyebrow amarelo acima do título. Geralmente o nome da seção. */
  eyebrow?: string;
  /** Título principal. Aceita ReactNode pra permitir <span> com destaque amarelo. */
  title: ReactNode;
  /** Subtítulo opcional abaixo do h1. */
  subtitle?: ReactNode;
  /** Conteúdo extra abaixo do subtítulo (ex: CTAs). */
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="relative bg-atria-navy py-20 md:py-28 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow && (
            <p className="font-inter text-atria-yellow-bright text-xs uppercase tracking-widest font-bold mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-barlow-condensed font-black text-4xl md:text-6xl text-white uppercase leading-none mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="font-inter text-white/70 text-lg max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
