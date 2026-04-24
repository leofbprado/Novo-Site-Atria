import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronRight, Car, Clock } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { trackLead } from "@/lib/track";
import { getVehicles, vehiclePath, type Vehicle } from "@/lib/firestore";

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

// Pills de filtro mapeadas pras queries que o Estoque lê: ?tipo=, ?precoMax=,
// ?cambio=, ?openFilters=1 (deep-link mobile que abre o drawer de filtros).
const QUICK_FILTERS: Array<{ label: string; href: string; highlight?: boolean }> = [
  { label: "Ver todos",    href: ROUTES.estoque, highlight: true },
  { label: "SUVs",         href: `${ROUTES.estoque}?tipo=SUV` },
  { label: "Até R$ 60k",   href: `${ROUTES.estoque}?precoMax=60000` },
  { label: "Hatches",      href: `${ROUTES.estoque}?tipo=Hatch` },
  { label: "Sedãs",        href: `${ROUTES.estoque}?tipo=Sedan` },
  { label: "Automáticos",  href: `${ROUTES.estoque}?cambio=Automática` },
  { label: "Marcas",       href: `${ROUTES.estoque}?openFilters=1` },
];

const fmtPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function HeroSection() {
  // Autocomplete state
  const [query, setQuery] = useState("");
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef(false);

  // Autocomplete data só carrega no primeiro contato com a busca. Antes baixava
  // 200+ veículos no mount e competia com o hero image pelo LCP. Agora: mouseenter
  // ou focus no input (tempo médio até o usuário digitar a segunda letra cobre o
  // round-trip do getVehicles).
  const prefetchVehicles = () => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    getVehicles().then(setAllVehicles).catch(() => {});
  };

  // Fuzzy search em marca + modelo + versão + ano (todas as tokens precisam bater)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return allVehicles
      .filter((v) => {
        const haystack = `${v.marca} ${v.modelo} ${v.versao ?? ""} ${v.ano}`.toLowerCase();
        return tokens.every((t) => haystack.includes(t));
      })
      .slice(0, 6);
  }, [query, allVehicles]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Se tem sugestão highlightada via teclado, vai direto pro veículo
    if (highlightIdx >= 0 && suggestions[highlightIdx]) {
      const v = suggestions[highlightIdx];
      trackLead({
        clarityEvent: "busca_realizada",
        gtmEvent: "cta_click",
        origem: "home",
        source: "hero-search-suggestion",
        termoBusca: query.trim(),
        marca: v.marca, modelo: v.modelo, ano: v.ano, preco: v.preco,
      });
      window.location.href = vehiclePath(v);
      return;
    }
    // Senão, vai pro estoque com a query como busca
    const q = query.trim();
    trackLead({
      clarityEvent: "busca_realizada",
      gtmEvent: "view_inventory",
      origem: "home",
      source: "hero-search-submit",
      termoBusca: q,
    });
    window.location.href = q ? `${ROUTES.estoque}?q=${encodeURIComponent(q)}` : ROUTES.estoque;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIdx(-1);
    }
  };

  const handlePillClick = (label: string) => {
    trackLead({
      clarityEvent: "busca_realizada",
      gtmEvent: "view_inventory",
      origem: "home",
      source: `hero-pill-${label.toLowerCase().replace(/\s+/g, "-")}`,
      termoBusca: label,
    });
  };

  const handleHeroCtaClick = () => {
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
      {/* Busca com autocomplete (pill + dropdown) */}
      <div className="px-4 pt-4 lg:pt-8">
        <div ref={searchWrapperRef} className="relative">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex w-full items-center gap-3 rounded-full bg-white px-5 py-3.5 lg:py-4 shadow-[0_2px_10px_-2px_rgba(0,26,140,0.15)] ring-1 ring-black/5 focus-within:ring-atria-navy/30 transition-shadow">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                  setHighlightIdx(-1);
                }}
                onFocus={() => { prefetchVehicles(); setShowSuggestions(true); }}
                onMouseEnter={prefetchVehicles}
                onKeyDown={handleKeyDown}
                placeholder="Que carro você está procurando?"
                autoComplete="off"
                aria-label="Buscar veículo"
                className="flex-1 min-w-0 bg-transparent text-[15px] lg:text-base text-atria-text-dark placeholder:text-atria-text-gray outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="text-atria-navy hover:text-atria-navy-dark transition-colors flex-shrink-0"
              >
                <Search size={20} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {/* Dropdown de sugestões — fuzzy match de marca + modelo + versão + ano */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,26,140,0.3)] overflow-hidden z-30 text-left ring-1 ring-black/5">
              {suggestions.map((v, idx) => (
                <a
                  key={v.id}
                  href={vehiclePath(v)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-atria-gray-medium last:border-b-0 transition-colors ${
                    idx === highlightIdx ? "bg-atria-gray-light" : "hover:bg-atria-gray-light"
                  }`}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  {v.fotos?.[0] ? (
                    <img
                      src={v.fotos[0]}
                      alt=""
                      loading="lazy"
                      className="w-14 h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-10 bg-atria-gray-light rounded flex items-center justify-center flex-shrink-0">
                      <Car size={16} className="text-atria-gray-medium" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-sm text-atria-text-dark truncate">
                      {v.marca} {v.modelo}
                    </p>
                    <p className="font-inter text-xs text-atria-text-gray truncate">
                      {v.ano} · {v.km?.toLocaleString("pt-BR")} km · {v.combustivel}
                    </p>
                  </div>
                  <span className="font-barlow-condensed font-bold text-base text-atria-navy whitespace-nowrap hidden sm:block">
                    {fmtPrice(v.preco)}
                  </span>
                </a>
              ))}
              {suggestions.length >= 6 && (
                <a
                  href={`${ROUTES.estoque}?q=${encodeURIComponent(query)}`}
                  className="block text-center py-3 bg-atria-navy text-white font-inter font-bold text-xs uppercase tracking-wider hover:bg-atria-navy/90 transition-colors"
                >
                  Ver todos os resultados →
                </a>
              )}
            </div>
          )}
        </div>
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
              O carro certo pra próxima fase da sua vida.
            </p>
            <a
              href={ROUTES.estoque}
              onClick={handleHeroCtaClick}
              className="mt-4 lg:mt-7 inline-flex whitespace-nowrap items-center justify-center rounded-full px-10 lg:px-14 py-4 lg:py-5 font-barlow-condensed font-bold text-lg lg:text-xl tracking-wide text-atria-navy shadow-[0_6px_16px_-4px_rgba(0,26,140,0.35)] active:translate-y-[1px] active:shadow-[0_3px_8px_-2px_rgba(0,26,140,0.35)] bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105"
            >
              Encontre seu carro
            </a>
          </div>
        </div>
      </div>

      {/* Card "Consignação Átria" — imagem R2 + CTA "Quero avaliar" */}
      <div className="px-4 mt-4 lg:mt-6">
        <a
          href={ROUTES.venderCarro}
          onClick={handleSellClick}
          className="flex items-center gap-4 lg:gap-6 rounded-2xl bg-white p-3 lg:p-5 pr-4 lg:pr-5 shadow-[0_2px_10px_-2px_rgba(0,26,140,0.12)] ring-1 ring-black/5 hover:bg-slate-50 transition-colors"
        >
          {/* Ilustração servida pelo Cloudflare R2 + Image Transformations */}
          <img
            src="https://atriaveiculos.com/cdn-cgi/image/width=200,format=auto/https://botoes.atriaveiculos.com/vender-carro.png"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="h-16 w-16 lg:h-20 lg:w-20 flex-shrink-0 object-contain"
          />

          <div className="flex-1 min-w-0">
            <div className="font-inter text-[10px] lg:text-[11px] font-semibold uppercase tracking-widest text-atria-yellow mb-0.5">
              Consignação Átria
            </div>
            <div className="font-barlow-condensed font-black text-[15px] lg:text-xl tracking-wide text-atria-navy uppercase leading-tight">
              Receba uma oferta pelo seu carro
            </div>
            <div className="flex items-center gap-1.5 text-[12px] lg:text-xs text-atria-text-gray leading-snug mt-1">
              <Clock size={12} className="flex-shrink-0" />
              <span>Avaliação em 2 minutos · sem compromisso</span>
            </div>
          </div>

          {/* Mobile: chevron · Desktop: botão outline "Quero avaliar" */}
          <ChevronRight size={20} strokeWidth={2.5} className="text-atria-navy sm:hidden flex-shrink-0" />
          <span className="hidden sm:inline-flex flex-shrink-0 items-center justify-center rounded-full border-2 border-atria-navy text-atria-navy font-barlow-condensed font-bold text-xs lg:text-sm uppercase tracking-wide px-4 py-2 lg:px-6 lg:py-2.5 hover:bg-atria-navy hover:text-white transition-colors">
            Quero avaliar
          </span>
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

// CarIcon removido — substituído por <img> servido pelo R2 (botoes.atriaveiculos.com)

export default HeroSection;
