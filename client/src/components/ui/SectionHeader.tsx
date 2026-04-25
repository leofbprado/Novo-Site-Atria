import type { ReactNode } from "react";

// SectionHeader — única fonte de verdade pro header de seção do site.
// Anatomia (top→bottom): eyebrow opcional → título → subtítulo opcional.
// `inverted` troca cores pra fundo escuro (navy hero etc).
//
// Eyebrow: Inter xs, uppercase, tracking-[0.3em]. Navy em fundo claro,
// amarelo em fundo escuro. Texto puro — nunca pill.
//
// Título: Barlow Condensed black uppercase, 4xl/5xl. Dark em fundo claro,
// white em fundo escuro. Aceita <span> com text-atria-yellow-bright pra
// destacar uma palavra-chave.
//
// Subtítulo: Inter regular, 1 frase opcional.
//
// Espaçamentos canônicos: eyebrow→title 8px (mb-2), title→subtitle 16px
// (mb-4), header→content 48px (mb-12) aplicado pelo wrapper.

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Fundo escuro: usa cores invertidas (eyebrow amarelo, título branco). */
  inverted?: boolean;
  /** Centraliza o bloco. Default false (alinhado à esquerda). */
  centered?: boolean;
  /** Margem inferior do bloco antes do conteúdo da seção. Default mb-12. */
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  inverted = false,
  centered = false,
  className = "mb-12",
}: Props) {
  const eyebrowColor = inverted ? "text-atria-yellow-bright" : "text-atria-navy";
  const titleColor = inverted ? "text-white" : "text-atria-text-dark";
  const subtitleColor = inverted ? "text-white/70" : "text-atria-text-gray";
  const align = centered ? "text-center" : "";

  return (
    <header className={`${align} ${className}`.trim()}>
      {eyebrow && (
        <p className={`font-inter text-xs font-semibold uppercase tracking-[0.3em] ${eyebrowColor} mb-2`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-barlow-condensed text-4xl md:text-5xl font-black uppercase leading-tight ${titleColor} ${subtitle ? "mb-4" : ""}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-inter text-base md:text-lg ${subtitleColor} ${centered ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
