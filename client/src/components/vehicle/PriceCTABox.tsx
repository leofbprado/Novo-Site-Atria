import { useEffect, useRef, useState } from "react";

/**
 * PriceCTABox — Box de preço + CTAs da ficha do veículo (mobile-first).
 *
 * Card visível logo abaixo da galeria. Quando sai da viewport no mobile,
 * aparece sticky bar fixa no rodapé. Asterisco clicável na sticky abre
 * tooltip com condições do financiamento.
 *
 * Design:
 *   - Visual unificado com cards do estoque (preço grande Barlow Black,
 *     parcela "Est. R$ X/mês*" honesta com disclosure).
 *   - WhatsApp = ícone circular gradient verde 500→600 + glifo branco
 *     oficial (mesmo padrão do FAB global pra coerência cross-site).
 *   - "Tenho interesse" = pill amarelo gradient + texto navy.
 *
 * Honestidade jurídica: sempre mostra "Est." (estimativa), "% entrada · Nx"
 * e "* Sujeito a aprovação de crédito".
 */

export interface PriceCTABoxProps {
  priceCash: number;
  installmentValue: number;
  installments: number;
  downPaymentPercent: number;
  whatsappUrl: string;
  onInterestClick: () => void;
  onWhatsappClick?: () => void;
  /** Quando false, não renderiza sticky bar nem observa scroll (use em desktop). */
  enableSticky?: boolean;
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Mesmo amarelo do CTA "Encontre seu carro" da home (atria-yellow-light → atria-yellow)
const yellowGradStyle = {
  background: "linear-gradient(180deg, #FFE95C 0%, #f9a825 100%)",
};

function WhatsappIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

function PriceCard(props: Omit<PriceCTABoxProps, "enableSticky">) {
  const {
    priceCash, installmentValue, installments, downPaymentPercent,
    whatsappUrl, onInterestClick, onWhatsappClick,
  } = props;

  return (
    <div className="rounded-2xl border border-atria-gray-medium bg-white p-5 shadow-sm">
      <div className="font-inter text-[11px] font-bold tracking-[0.12em] uppercase text-atria-text-gray">
        À Vista
      </div>
      <div className="mt-1 font-barlow-condensed text-4xl font-black leading-none text-atria-navy tabular-nums">
        {formatBRL(priceCash)}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] font-inter">
        <span className="text-atria-text-gray">Est.</span>
        <b className="font-barlow-condensed text-base font-bold text-atria-navy tabular-nums">
          {formatBRL(installmentValue)}
        </b>
        <span className="text-atria-text-gray">/mês*</span>
        <span className="ml-auto whitespace-nowrap text-atria-text-gray">
          {downPaymentPercent}% entrada · {installments}×
        </span>
      </div>
      <div className="mt-4 flex items-stretch gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsappClick}
          aria-label="Falar pelo WhatsApp"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 shadow-md transition active:scale-95"
        >
          <WhatsappIcon size={24} />
        </a>
        <button
          type="button"
          onClick={onInterestClick}
          style={yellowGradStyle}
          className="flex-1 rounded-full font-inter text-[15px] font-bold tracking-wide text-atria-navy shadow-sm transition active:scale-[0.98] hover:brightness-105"
        >
          Tenho interesse
        </button>
      </div>
      <div className="mt-2.5 text-right text-[10.5px] italic text-atria-text-gray font-inter">
        * Sujeito a aprovação de crédito
      </div>
    </div>
  );
}

function StickyBar(props: Omit<PriceCTABoxProps, "enableSticky">) {
  const {
    priceCash, installmentValue, installments, downPaymentPercent,
    whatsappUrl, onInterestClick, onWhatsappClick,
  } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTooltipOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [tooltipOpen]);

  return (
    <div
      ref={popoverRef}
      className="relative border-t border-atria-gray-medium bg-white px-3 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom, 0px))` }}
    >
      {tooltipOpen && (
        <div
          role="tooltip"
          className="absolute bottom-full left-3 mb-2 max-w-[280px] rounded-lg bg-atria-navy px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg font-inter"
        >
          <div className="mb-0.5 font-bold">Estimativa de financiamento</div>
          <div className="text-white/80">
            {downPaymentPercent}% de entrada · {installments} parcelas
          </div>
          <div className="mt-1 italic text-white/60">* Sujeito a aprovação de crédito</div>
          <div className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-atria-navy" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-barlow-condensed text-[22px] font-black leading-none text-atria-navy tabular-nums">
            {formatBRL(priceCash)}
          </div>
          <button
            type="button"
            onClick={() => setTooltipOpen((o) => !o)}
            aria-expanded={tooltipOpen}
            aria-label="Ver condições do financiamento"
            className="mt-1 cursor-pointer text-left text-[11px] text-atria-text-gray hover:text-atria-navy font-inter"
          >
            Est.{" "}
            <b className="font-barlow-condensed text-[12px] font-bold text-atria-navy tabular-nums">
              {formatBRL(installmentValue)}
            </b>
            /mês{" "}
            <span className="underline decoration-dotted underline-offset-2">*</span>
          </button>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsappClick}
          aria-label="Falar pelo WhatsApp"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 shadow-md transition active:scale-95"
        >
          <WhatsappIcon size={22} />
        </a>
        <button
          type="button"
          onClick={onInterestClick}
          style={yellowGradStyle}
          className="whitespace-nowrap rounded-full px-5 py-3 font-inter text-[14px] font-bold tracking-wide text-atria-navy shadow-sm hover:brightness-105"
        >
          Tenho interesse
        </button>
      </div>
    </div>
  );
}

export function PriceCTABox(props: PriceCTABoxProps) {
  const { enableSticky = true, ...cardProps } = props;
  const cardRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (!enableSticky) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -20px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enableSticky]);

  return (
    <>
      <div ref={cardRef}>
        <PriceCard {...cardProps} />
      </div>
      {enableSticky && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 lg:hidden ${
            showSticky ? "translate-y-0" : "translate-y-full"
          }`}
          aria-hidden={!showSticky}
        >
          <StickyBar {...cardProps} />
        </div>
      )}
    </>
  );
}

export default PriceCTABox;
