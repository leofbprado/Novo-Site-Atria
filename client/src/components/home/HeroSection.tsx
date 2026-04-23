import { Search, ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { trackLead } from "@/lib/track";

// ─── Hero images: Cloudflare R2 + Image Transformations ──────────────────────
// Original PNGs vivem no R2 (hero.atriaveiculos.com). O Cloudflare transforma
// on-the-fly via /cdn-cgi/image/{params}/{source-url}:
//   - format=auto → serve WebP pros browsers que suportam, JPG fallback
//   - gravity=right (desktop) → mantém a família à direita, sky à esquerda pro texto
//   - gravity=center (mobile) → centraliza o sujeito no crop 4:5
// Troca HERO_ID pra "hero-2" quando quiser alternar a foto.
const CF = "https://atriaveiculos.com/cdn-cgi/image";
const HERO_ID = "hero-1";
const HERO_SRC = `https://hero.atriaveiculos.com/${HERO_ID}`;
const HERO_MOBILE = `${CF}/width=800,height=1000,fit=cover,gravity=center,quality=78,format=auto/${HERO_SRC}-mobile.png`;
const HERO_DESKTOP = `${CF}/width=1600,height=700,fit=cover,gravity=right,quality=75,format=auto/${HERO_SRC}-desktop.png`;

// Pills de filtro mapeadas pras queries que o Estoque já lê (`?tipo=`, `?precoMax=`).
// "Automáticos" fica sem filtro (?cambio= não é lido hoje — backlog).
const QUICK_FILTERS: Array<{ label: string; href: string; highlight?: boolean }> = [
  { label: "Ver todos",    href: ROUTES.estoque, highlight: true },
  { label: "SUVs",         href: `${ROUTES.estoque}?tipo=SUV` },
  { label: "Até R$ 60k",   href: `${ROUTES.estoque}?precoMax=60000` },
  { label: "Hatches",      href: `${ROUTES.estoque}?tipo=Hatch` },
  { label: "Sedãs",        href: `${ROUTES.estoque}?tipo=Sedan` },
  { label: "Picapes",      href: `${ROUTES.estoque}?tipo=Pickup` },
  { label: "Automáticos",  href: ROUTES.estoque },
];

export function HeroSection() {
  const handlePillClick = (label: string) => {
    trackLead({
      clarityEvent: "busca_realizada",
      gtmEvent: "view_inventory",
      origem: "home",
      source: `hero-pill-${label.toLowerCase().replace(/\s+/g, "-")}`,
      termoBusca: label,
    });
  };

  const handleCtaClick = () => {
    trackLead({
      clarityEvent: "busca_realizada",
      gtmEvent: "view_inventory",
      origem: "home",
      source: "hero-cta-encontre-seu-carro",
    });
  };

  const handleSellClick = () => {
    trackLead({
      clarityEvent: "lead_vender_carro",
      gtmEvent: "cta_click",
      origem: "home",
      source: "hero-sell-card",
    });
  };

  return (
    <section className="bg-white font-inter text-atria-text-dark lg:max-w-7xl lg:mx-auto">
      {/* Busca (pill com sombra suave) */}
      <div className="px-4 pt-4 lg:pt-8">
        <a
          href={ROUTES.estoque}
          onClick={handleCtaClick}
          aria-label="Buscar veículo"
          className="flex w-full items-center gap-3 rounded-full bg-white px-5 py-3.5 lg:py-4 text-left shadow-[0_2px_10px_-2px_rgba(0,26,140,0.15)] ring-1 ring-black/5 hover:ring-atria-navy/20 transition-shadow"
        >
          <span className="flex-1 text-[15px] lg:text-base text-atria-text-gray">
            Que carro você está procurando?
          </span>
          <Search size={20} strokeWidth={2.5} className="text-atria-navy" />
        </a>
      </div>

      {/* Pills — mobile: scroll horizontal | desktop: wrap centralizado */}
      <nav
        aria-label="Filtros rápidos"
        className="mt-4 overflow-x-auto lg:overflow-visible"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-2 lg:gap-2.5 px-4 pb-1 w-max lg:w-auto lg:flex-wrap lg:justify-center">
          {QUICK_FILTERS.map((f) => (
            <a
              key={f.label}
              href={f.href}
              onClick={() => handlePillClick(f.label)}
              className={`whitespace-nowrap rounded-full border-2 px-4 lg:px-5 py-2 lg:py-2.5 font-barlow-condensed font-bold text-[13px] lg:text-sm tracking-wide uppercase transition-colors ${
                f.highlight
                  ? "border-atria-navy bg-atria-navy text-white"
                  : "border-atria-navy bg-white text-atria-navy hover:bg-atria-navy/5"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero card — mobile 4:5 (foto full, texto sobreposto) · desktop 16:7 (texto esq, foto dir) */}
      <div className="px-4 mt-4 lg:mt-6">
        <div className="relative overflow-hidden rounded-3xl aspect-[4/5] lg:aspect-[16/7] bg-[#b6d4f0]">
          <picture>
            <source media="(min-width: 1024px)" srcSet={HERO_DESKTOP} />
            <img
              src={HERO_MOBILE}
              alt="Família feliz com SUV em estrada panorâmica"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Fade de contraste — mobile: topo | desktop: esquerda */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-white/40 via-white/10 to-transparent lg:hidden"
          />
          <div
            aria-hidden
            className="hidden lg:block absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-white/70 via-white/30 to-transparent"
          />

          {/* Copy + CTA */}
          <div className="relative z-10 p-5 pt-6 lg:p-14 lg:pt-16 lg:max-w-[55%]">
            <h1 className="font-barlow-condensed font-black text-[44px] lg:text-[84px] leading-[0.9] tracking-tight text-atria-navy uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
              Guiada
              <br />
              por você.
            </h1>
            <p className="mt-2 lg:mt-4 font-inter font-semibold text-[15px] lg:text-xl leading-snug text-atria-navy max-w-[85%] lg:max-w-[90%]">
              A gente descomplica comprar e vender seu seminovo.
            </p>
            <a
              href={ROUTES.estoque}
              onClick={handleCtaClick}
              className="mt-4 lg:mt-7 inline-flex whitespace-nowrap items-center justify-center rounded-full px-7 lg:px-10 py-3.5 lg:py-4.5 font-barlow-condensed font-bold text-[16px] lg:text-lg tracking-wide text-atria-navy shadow-[0_6px_16px_-4px_rgba(0,26,140,0.35)] active:translate-y-[1px] active:shadow-[0_3px_8px_-2px_rgba(0,26,140,0.35)] bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105"
            >
              Encontre seu carro
            </a>
          </div>
        </div>
      </div>

      {/* Card "Vender seu carro?" — consignação first */}
      <div className="px-4 mt-4 lg:mt-6">
        <a
          href={ROUTES.venderCarro}
          onClick={handleSellClick}
          className="flex items-center gap-3 lg:gap-5 rounded-2xl bg-white p-3 lg:p-5 pr-4 lg:pr-6 shadow-[0_2px_10px_-2px_rgba(0,26,140,0.12)] ring-1 ring-black/5 hover:bg-slate-50 transition-colors"
        >
          <div className="relative flex h-14 w-14 lg:h-16 lg:w-16 flex-shrink-0 items-center justify-center rounded-xl bg-atria-gray-light">
            <CarIcon className="h-8 w-8 lg:h-9 lg:w-9 text-atria-navy" />
            <span className="absolute -top-1 -right-1 rounded-md px-1.5 py-0.5 text-[8px] lg:text-[9px] font-barlow-condensed font-black tracking-wide text-atria-navy leading-none bg-gradient-to-b from-atria-yellow-light to-atria-yellow">
              R$
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-barlow-condensed font-bold text-[15px] lg:text-lg tracking-wide text-atria-navy uppercase leading-tight">
              Vender seu carro?
            </div>
            <div className="text-[13px] lg:text-sm text-atria-text-gray leading-snug mt-0.5">
              Receba uma oferta real em 2 minutos
            </div>
          </div>
          <ChevronRight size={20} strokeWidth={2.5} className="text-atria-navy" />
        </a>
      </div>

      {/* Trust row */}
      <div className="px-5 lg:px-8 mt-5 lg:mt-8 mb-8 lg:mb-12 flex items-center justify-between lg:justify-center lg:gap-8 text-[11px] lg:text-xs uppercase tracking-wide text-atria-text-gray font-barlow-condensed font-bold">
        <span>+12 anos</span>
        <Dot />
        <span>+10k carros</span>
        <Dot />
        <span>3 lojas</span>
        <Dot />
        <span>Garantia 90d</span>
      </div>
    </section>
  );
}

function Dot() {
  return <span aria-hidden className="h-1 w-1 rounded-full bg-atria-gray-medium" />;
}

// Ícone de carro usado no card "Vender seu carro?" — não há equivalente exato
// no lucide-react (o Car do lucide é lateral; queríamos frontal/3-quartos).
function CarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

export default HeroSection;
