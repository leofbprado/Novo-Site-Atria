import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Car, ChevronDown, CheckCircle } from "lucide-react";
import { getVehicles, saveLead, type Vehicle } from "@/lib/firestore";

// ─── Schema.org injection ─────────────────────────────────────────────────────
function usePageSEO(vehicles: Vehicle[]) {
  useEffect(() => {
    document.title = "Estoque de Veículos Seminovos | Átria Veículos - Campinas";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Confira nosso estoque de veículos seminovos em Campinas. SUVs, sedans, hatches e picapes das melhores marcas com financiamento facilitado. BMW, Mercedes, Audi, Toyota, Jeep e muito mais.");

    if (vehicles.length === 0) return;
    const existing = document.getElementById("schema-estoque");
    if (existing) existing.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Estoque de Veículos Seminovos – Átria Veículos",
      "url": "https://novo-site-atria.web.app/estoque",
      "numberOfItems": vehicles.length,
      "itemListElement": vehicles.map((v, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Car",
          "name": `${v.marca} ${v.modelo} ${v.ano}`,
          "brand": { "@type": "Brand", "name": v.marca },
          "model": v.modelo,
          "vehicleModelDate": String(v.ano),
          "color": v.cor,
          "vehicleTransmission": v.cambio,
          "fuelType": v.combustivel,
          "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": v.km,
            "unitCode": "KMT"
          },
          "offers": {
            "@type": "Offer",
            "price": v.preco,
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "AutoDealer", "name": "Átria Veículos" }
          },
          "url": `https://novo-site-atria.web.app/veiculo/${v.slug}`
        }
      }))
    };

    const script = document.createElement("script");
    script.id = "schema-estoque";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { document.getElementById("schema-estoque")?.remove(); };
  }, [vehicles]);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const TIPO_OPTIONS = ["Todos", "SUV", "Sedan", "Hatch", "Pickup"] as const;
type TipoFilter = typeof TIPO_OPTIONS[number];

const PRECO_OPTIONS = [
  { label: "Qualquer preço", min: 0, max: Infinity },
  { label: "Até R$ 80 mil", min: 0, max: 80000 },
  { label: "R$ 80–150 mil", min: 80000, max: 150000 },
  { label: "R$ 150–250 mil", min: 150000, max: 250000 },
  { label: "Acima de R$ 250 mil", min: 250000, max: Infinity },
] as const;

const ANO_OPTIONS = [
  { label: "Qualquer ano", min: 0 },
  { label: "2023 ou mais novo", min: 2023 },
  { label: "2022 ou mais novo", min: 2022 },
  { label: "2021 ou mais novo", min: 2021 },
  { label: "2020 ou mais novo", min: 2020 },
] as const;

const SORT_OPTIONS = [
  { label: "Mais recente", key: "recente" },
  { label: "Menor preço", key: "preco_asc" },
  { label: "Maior preço", key: "preco_desc" },
  { label: "Menor KM", key: "km_asc" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-atria-gray-medium animate-pulse">
      <div className="aspect-[4/3] bg-atria-gray-medium" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-atria-gray-medium rounded w-1/3" />
        <div className="h-5 bg-atria-gray-medium rounded w-3/4" />
        <div className="h-4 bg-atria-gray-medium rounded w-1/2" />
        <div className="h-7 bg-atria-gray-medium rounded w-2/5 mt-2" />
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <div className="flex-1 h-10 bg-atria-gray-medium rounded" />
        <div className="w-24 h-10 bg-atria-gray-medium rounded" />
      </div>
    </div>
  );
}

// ─── Vehicle Card ─────────────────────────────────────────────────────────────
function VehicleCard({ v }: { v: Vehicle }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group bg-white rounded-xl overflow-hidden border border-atria-gray-medium hover:shadow-lg transition-shadow"
      itemScope
      itemType="https://schema.org/Car"
    >
      <a href={`/veiculo/${v.slug}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-atria-gray-light">
          {v.fotos?.[0] ? (
            <img
              src={v.fotos[0]}
              alt={`${titulo} - ${v.cor} - ${v.km?.toLocaleString("pt-BR")} km`}
              width={800}
              height={600}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              itemProp="image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-label="Sem foto disponível">
              <Car size={48} className="text-atria-gray-medium" aria-hidden="true" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {v.destaque && (
              <span className="bg-atria-yellow text-atria-navy text-xs font-inter font-bold uppercase px-2.5 py-1 rounded">
                Destaque
              </span>
            )}
            {v.tipo && (
              <span className="bg-atria-navy/80 text-white text-xs font-inter uppercase px-2.5 py-1 rounded">
                {v.tipo}
              </span>
            )}
          </div>
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-inter font-bold px-2.5 py-1 rounded">
            {v.ano}
          </span>
        </div>
      </a>

      <div className="p-5 pb-3">
        <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider mb-1" itemProp="brand">
          {v.marca}
        </p>
        <a href={`/veiculo/${v.slug}`}>
          <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark leading-tight mb-2 hover:text-atria-navy transition-colors" itemProp="name">
            {titulo}
          </h3>
        </a>
        <p className="font-inter text-sm text-atria-text-gray line-clamp-1 mb-3" itemProp="description">
          {v.descricao}
        </p>

        {/* Specs */}
        <ul className="flex gap-3 flex-wrap mb-4" role="list" aria-label="Especificações do veículo">
          {[
            { label: `${v.ano}`, title: "Ano" },
            { label: `${v.km?.toLocaleString("pt-BR")} km`, title: "Quilometragem" },
            { label: v.cambio, title: "Câmbio" },
            { label: v.combustivel, title: "Combustível" },
          ].map((spec) => (
            <li key={spec.title} className="flex items-center gap-1 font-inter text-xs text-atria-text-gray" title={spec.title}>
              <span className="w-1 h-1 bg-atria-gray-medium rounded-full" aria-hidden="true" />
              {spec.label}
            </li>
          ))}
        </ul>

        <p className="font-barlow-condensed font-black text-2xl text-atria-navy" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price" content={String(v.preco)}>
            {fmt(v.preco)}
          </span>
          <meta itemProp="priceCurrency" content="BRL" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
        </p>
      </div>

      {/* CTAs */}
      <div className="px-5 pb-5 flex gap-2 mt-2">
        <a
          href={waLink(`Olá! Vi o ${titulo} ${v.ano} por ${fmt(v.preco)} no estoque da Átria e tenho interesse. Podem me dar mais informações?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-inter font-bold text-sm uppercase tracking-wider py-2.5 rounded text-center transition-colors"
          aria-label={`Quero esse ${titulo}`}
        >
          QUERO ESSE
        </a>
        <a
          href={`/veiculo/${v.slug}`}
          className="px-4 py-2.5 border border-atria-gray-medium text-atria-text-gray hover:border-atria-navy hover:text-atria-navy font-inter text-sm font-semibold rounded transition-all text-center"
          aria-label={`Ver detalhes do ${titulo}`}
        >
          Detalhes
        </a>
      </div>
    </motion.article>
  );
}

// ─── Lead CTA (não encontrou) ─────────────────────────────────────────────────
function NaoEncontrou() {
  const [form, setForm] = useState({ nome: "", whatsapp: "", busca: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await saveLead({ nome: form.nome, whatsapp: form.whatsapp, source: "estoque-nao-encontrou", query: form.busca });
    setSending(false);
    setDone(true);
    setTimeout(() => {
      window.open(waLink(`Olá! Me chamo ${form.nome}. Não encontrei o que procurava no estoque. Busco: ${form.busca}`), "_blank");
    }, 800);
  };

  return (
    <section className="bg-atria-gray-light rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto mt-12">
      {done ? (
        <div>
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark">
            Recebemos! Abrindo WhatsApp...
          </h3>
        </div>
      ) : (
        <>
          <h3 className="font-barlow-condensed font-black text-2xl text-atria-text-dark mb-2">
            Não encontrou o que procura?
          </h3>
          <p className="font-inter text-atria-text-gray text-sm mb-6">
            Deixe seu contato e diga o que procura. Nossa equipe buscará o veículo ideal para você.
          </p>
          <form className="space-y-3 text-left" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Seu nome" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors" />
              <input type="tel" placeholder="WhatsApp: (19) 99999-9999" value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors" />
            </div>
            <input type="text" placeholder="O que você busca? Ex: SUV automático até R$ 150 mil" value={form.busca}
              onChange={(e) => setForm({ ...form, busca: e.target.value })} required
              className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors" />
            <button type="submit" disabled={sending} className="btn-navy w-full rounded-lg disabled:opacity-60">
              {sending ? "Enviando..." : "QUERO QUE ME AJUDEM A ENCONTRAR"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
interface Filters {
  busca: string;
  tipo: TipoFilter;
  precoIdx: number;
  anoIdx: number;
  sort: SortKey;
}

function FilterBar({ filters, onChange, total }: { filters: Filters; onChange: (f: Filters) => void; total: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-atria-gray-medium shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atria-text-gray" aria-hidden="true" />
            <input
              type="search"
              placeholder="Marca ou modelo..."
              value={filters.busca}
              onChange={(e) => set({ busca: e.target.value })}
              aria-label="Buscar por marca ou modelo"
              className="w-full pl-9 pr-4 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy transition-colors"
            />
          </div>

          {/* Tipo */}
          <div className="flex gap-1.5">
            {TIPO_OPTIONS.map((t) => (
              <button key={t} onClick={() => set({ tipo: t })}
                aria-pressed={filters.tipo === t}
                className={`px-4 py-2 font-inter text-sm font-semibold rounded-full transition-all ${
                  filters.tipo === t ? "bg-atria-navy text-white" : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
                }`}>{t}</button>
            ))}
          </div>

          {/* Preço select */}
          <div className="relative">
            <select
              value={filters.precoIdx}
              onChange={(e) => set({ precoIdx: Number(e.target.value) })}
              aria-label="Filtrar por faixa de preço"
              className="appearance-none pl-3 pr-8 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy bg-white cursor-pointer"
            >
              {PRECO_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-atria-text-gray pointer-events-none" />
          </div>

          {/* Ano select */}
          <div className="relative">
            <select
              value={filters.anoIdx}
              onChange={(e) => set({ anoIdx: Number(e.target.value) })}
              aria-label="Filtrar por ano"
              className="appearance-none pl-3 pr-8 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy bg-white cursor-pointer"
            >
              {ANO_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-atria-text-gray pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as SortKey })}
              aria-label="Ordenar por"
              className="appearance-none pl-3 pr-8 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-atria-text-gray pointer-events-none" />
          </div>

          <span className="font-inter text-sm text-atria-text-gray ml-auto whitespace-nowrap">
            {total} veículo{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atria-text-gray" />
            <input type="search" placeholder="Buscar..." value={filters.busca}
              onChange={(e) => set({ busca: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy transition-colors" />
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm font-semibold text-atria-text-dark"
            aria-expanded={mobileOpen} aria-label="Abrir filtros">
            <SlidersHorizontal size={16} />
            Filtros
          </button>
          <span className="font-inter text-sm text-atria-text-gray whitespace-nowrap">{total}</span>
        </div>

        {/* Mobile expanded */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="pt-3 pb-1 space-y-3">
                <div className="flex gap-1.5 flex-wrap">
                  {TIPO_OPTIONS.map((t) => (
                    <button key={t} onClick={() => set({ tipo: t })}
                      className={`px-3 py-1.5 font-inter text-sm font-semibold rounded-full transition-all ${
                        filters.tipo === t ? "bg-atria-navy text-white" : "bg-atria-gray-light text-atria-text-dark"
                      }`}>{t}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={filters.precoIdx} onChange={(e) => set({ precoIdx: Number(e.target.value) })}
                    className="border border-atria-gray-medium rounded-lg px-3 py-2.5 font-inter text-sm outline-none bg-white">
                    {PRECO_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
                  </select>
                  <select value={filters.anoIdx} onChange={(e) => set({ anoIdx: Number(e.target.value) })}
                    className="border border-atria-gray-medium rounded-lg px-3 py-2.5 font-inter text-sm outline-none bg-white">
                    {ANO_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
                  </select>
                </div>
                <select value={filters.sort} onChange={(e) => set({ sort: e.target.value as SortKey })}
                  className="w-full border border-atria-gray-medium rounded-lg px-3 py-2.5 font-inter text-sm outline-none bg-white">
                  {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Estoque() {
  const [all, setAll] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    busca: "",
    tipo: "Todos",
    precoIdx: 0,
    anoIdx: 0,
    sort: "recente",
  });

  // Read query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters((f) => ({
      ...f,
      busca: params.get("q") ?? "",
      tipo: (params.get("tipo") as TipoFilter) ?? "Todos",
    }));
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.busca) params.set("q", filters.busca);
    if (filters.tipo !== "Todos") params.set("tipo", filters.tipo);
    const url = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", url);
  }, [filters.busca, filters.tipo]);

  useEffect(() => {
    getVehicles().then((v) => { setAll(v); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const preco = PRECO_OPTIONS[filters.precoIdx];
    const anoMin = ANO_OPTIONS[filters.anoIdx].min;
    const q = filters.busca.toLowerCase();

    let result = all.filter((v) => {
      if (filters.tipo !== "Todos" && v.tipo?.toLowerCase() !== filters.tipo.toLowerCase()) return false;
      if (v.preco < preco.min || v.preco > preco.max) return false;
      if (anoMin > 0 && v.ano < anoMin) return false;
      if (q && !`${v.marca} ${v.modelo} ${v.titulo ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (filters.sort) {
      case "preco_asc": result = [...result].sort((a, b) => a.preco - b.preco); break;
      case "preco_desc": result = [...result].sort((a, b) => b.preco - a.preco); break;
      case "km_asc": result = [...result].sort((a, b) => a.km - b.km); break;
      default: result = [...result].sort((a, b) => b.createdAt.getTime?.() - a.createdAt.getTime?.()); break;
    }
    return result;
  }, [all, filters]);

  usePageSEO(all);

  const handleFiltersChange = useCallback((f: Filters) => setFilters(f), []);

  return (
    <>
      {/* Hero compacto */}
      <header className="bg-atria-navy pt-24 pb-10">
        <div className="container mx-auto px-4">
          <p className="section-label mb-2">Campinas, SP</p>
          <h1 className="font-barlow-condensed font-black text-5xl md:text-6xl uppercase text-white leading-none">
            Nosso Estoque
          </h1>
          <p className="font-inter text-white/60 mt-2">
            {loading ? "Carregando veículos..." : `${all.length} veículos disponíveis`}
          </p>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} onChange={handleFiltersChange} total={filtered.length} />

      {/* Grid */}
      <main className="container mx-auto px-4 py-10" id="grid-veiculos">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Carregando veículos" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label={`${filtered.length} veículos encontrados`}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((v) => (
                <li key={v.id}>
                  <VehicleCard v={v} />
                </li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="text-center py-20" role="status">
            <Car size={64} className="text-atria-gray-medium mx-auto mb-4" aria-hidden="true" />
            <h2 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-2">
              Nenhum veículo encontrado
            </h2>
            <p className="font-inter text-atria-text-gray mb-6">
              Tente ajustar os filtros ou{" "}
              <button
                onClick={() => setFilters({ busca: "", tipo: "Todos", precoIdx: 0, anoIdx: 0, sort: "recente" })}
                className="text-atria-navy underline font-semibold"
              >
                limpar todos os filtros
              </button>
            </p>
          </div>
        )}

        <NaoEncontrou />
      </main>
    </>
  );
}
