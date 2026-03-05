import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Car, ChevronDown, CheckCircle } from "lucide-react";
import { getVehicles, saveLead, type Vehicle } from "@/lib/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (n: number) => `${n.toLocaleString("pt-BR")} km`;

const TIPOS = ["SUV", "Sedan", "Hatch", "Pickup"];
const COMBUSTIVEIS = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"];
const CAMBIOS = ["Automática", "Manual", "CVT"];
const COR_MAP: Record<string, string> = {
  Preto: "#1a1a1a",
  Branco: "#f0f0f0",
  Prata: "#b0b0b0",
  Cinza: "#808080",
  Vermelho: "#dc2626",
  Azul: "#2563eb",
  Verde: "#16a34a",
  Bege: "#d4b896",
  Laranja: "#ea580c",
  Amarelo: "#ca8a04",
};

const SORT_OPTIONS = [
  { label: "Mais recente", key: "recente" },
  { label: "Menor preço", key: "preco_asc" },
  { label: "Maior preço", key: "preco_desc" },
  { label: "Menor km", key: "km_asc" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

const TIPO_ICONS: Record<string, JSX.Element> = {
  SUV: (
    <svg viewBox="0 0 64 32" fill="currentColor" className="w-10 h-5">
      <rect x="6" y="14" width="52" height="12" rx="3"/>
      <path d="M16 14 C18 6 22 4 32 4 C42 4 46 6 48 14Z"/>
      <circle cx="16" cy="27" r="5"/><circle cx="48" cy="27" r="5"/>
    </svg>
  ),
  Sedan: (
    <svg viewBox="0 0 64 32" fill="currentColor" className="w-10 h-5">
      <rect x="4" y="16" width="56" height="10" rx="2"/>
      <path d="M14 16 C16 8 20 6 32 6 C44 6 48 8 50 16Z"/>
      <circle cx="15" cy="27" r="5"/><circle cx="49" cy="27" r="5"/>
    </svg>
  ),
  Hatch: (
    <svg viewBox="0 0 64 32" fill="currentColor" className="w-10 h-5">
      <rect x="4" y="16" width="56" height="10" rx="2"/>
      <path d="M16 16 C16 8 20 5 36 5 C48 5 52 8 52 16Z"/>
      <circle cx="15" cy="27" r="5"/><circle cx="49" cy="27" r="5"/>
    </svg>
  ),
  Pickup: (
    <svg viewBox="0 0 64 32" fill="currentColor" className="w-10 h-5">
      <rect x="4" y="14" width="56" height="12" rx="2"/>
      <path d="M16 14 C18 6 22 4 36 4 C44 4 46 8 46 14Z"/>
      <line x1="46" y1="14" x2="46" y2="26" stroke="white" strokeWidth="2"/>
      <circle cx="14" cy="27" r="5"/><circle cx="50" cy="27" r="5"/>
    </svg>
  ),
};

// ─── Filter State ─────────────────────────────────────────────────────────────
interface FilterState {
  busca: string;
  preco: [number, number];
  marcas: string[];
  tipos: string[];
  ano: [number, number];
  km: [number, number];
  combustivel: string[];
  cambio: string[];
  cores: string[];
  portas: number[];
  sort: SortKey;
}

const DEFAULT_RANGES = {
  preco: [0, 500000] as [number, number],
  ano: [2018, 2025] as [number, number],
  km: [0, 150000] as [number, number],
};

const EMPTY_FILTERS: FilterState = {
  busca: "",
  preco: [...DEFAULT_RANGES.preco],
  marcas: [],
  tipos: [],
  ano: [...DEFAULT_RANGES.ano],
  km: [...DEFAULT_RANGES.km],
  combustivel: [],
  cambio: [],
  cores: [],
  portas: [],
  sort: "recente",
};

function isFilterActive(f: FilterState): boolean {
  return (
    f.busca !== "" ||
    f.marcas.length > 0 ||
    f.tipos.length > 0 ||
    f.combustivel.length > 0 ||
    f.cambio.length > 0 ||
    f.cores.length > 0 ||
    f.portas.length > 0 ||
    f.preco[0] > DEFAULT_RANGES.preco[0] ||
    f.preco[1] < DEFAULT_RANGES.preco[1] ||
    f.ano[0] > DEFAULT_RANGES.ano[0] ||
    f.ano[1] < DEFAULT_RANGES.ano[1] ||
    f.km[0] > DEFAULT_RANGES.km[0] ||
    f.km[1] < DEFAULT_RANGES.km[1]
  );
}

type ActiveChip = { label: string; onRemove: () => void };

// ─── Schema SEO ───────────────────────────────────────────────────────────────
function usePageSEO(vehicles: Vehicle[]) {
  useEffect(() => {
    document.title = "Estoque de Veículos Seminovos | Átria Veículos - Campinas";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Confira nosso estoque de veículos seminovos em Campinas. SUVs, sedans, hatches e picapes das melhores marcas com financiamento facilitado.");
    if (!vehicles.length) return;
    const old = document.getElementById("schema-estoque");
    if (old) old.remove();
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Estoque – Átria Veículos",
      "numberOfItems": vehicles.length,
      "itemListElement": vehicles.map((v, i) => ({
        "@type": "ListItem", "position": i + 1,
        "item": {
          "@type": "Car",
          "name": `${v.marca} ${v.modelo} ${v.ano}`,
          "brand": { "@type": "Brand", "name": v.marca },
          "model": v.modelo, "vehicleModelDate": String(v.ano),
          "mileageFromOdometer": { "@type": "QuantitativeValue", "value": v.km, "unitCode": "KMT" },
          "offers": { "@type": "Offer", "price": v.preco, "priceCurrency": "BRL", "availability": "https://schema.org/InStock" },
          "url": `https://novo-site-atria.web.app/veiculo/${v.slug}`,
        },
      })),
    };
    const s = document.createElement("script");
    s.id = "schema-estoque"; s.type = "application/ld+json";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { document.getElementById("schema-estoque")?.remove(); };
  }, [vehicles]);
}

// ─── RangeSlider ──────────────────────────────────────────────────────────────
function RangeSlider({
  min, max, value, onChange, step = 1,
  formatValue = (v: number) => String(v),
}: {
  min: number; max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  step?: number;
  formatValue?: (v: number) => string;
}) {
  const [lo, hi] = value;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const atMax = lo >= max - (max - min) * 0.05;

  return (
    <div>
      <div className="relative h-5 flex items-center mb-3">
        {/* Track */}
        <div className="absolute w-full h-1 bg-atria-gray-medium rounded-full" />
        {/* Active range */}
        <div
          className="absolute h-1 bg-atria-navy rounded-full"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        {/* Min thumb */}
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="rs-thumb"
          style={{ zIndex: atMax ? 5 : 3 }}
          aria-label="Valor mínimo"
        />
        {/* Max thumb */}
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="rs-thumb"
          style={{ zIndex: atMax ? 3 : 5 }}
          aria-label="Valor máximo"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-inter text-xs font-semibold text-atria-navy">{formatValue(lo)}</span>
        <span className="font-inter text-xs font-semibold text-atria-navy">{formatValue(hi)}</span>
      </div>
    </div>
  );
}

// ─── PriceHistogram ───────────────────────────────────────────────────────────
function PriceHistogram({
  vehicles, range,
}: { vehicles: Vehicle[]; range: [number, number] }) {
  const BINS = 14;
  const allMin = DEFAULT_RANGES.preco[0];
  const allMax = DEFAULT_RANGES.preco[1];
  const binW = (allMax - allMin) / BINS;

  const counts = useMemo(() =>
    Array.from({ length: BINS }, (_, i) => {
      const lo = allMin + i * binW;
      const hi = lo + binW;
      return vehicles.filter((v) => v.preco >= lo && v.preco < hi).length;
    }),
    [vehicles, binW, allMin]
  );

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="flex items-end gap-px h-10 mb-1" aria-hidden="true">
      {counts.map((count, i) => {
        const binLo = allMin + i * binW;
        const binHi = binLo + binW;
        const active = binHi >= range[0] && binLo <= range[1];
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-colors duration-150 ${active ? "bg-atria-navy" : "bg-atria-gray-medium"}`}
            style={{ height: `${Math.max(8, (count / maxCount) * 100)}%` }}
            title={`${count} veículo${count !== 1 ? "s" : ""}`}
          />
        );
      })}
    </div>
  );
}

// ─── FilterAccordion ──────────────────────────────────────────────────────────
function FilterAccordion({
  title, defaultOpen = false, hasActive = false, children,
}: {
  title: string; defaultOpen?: boolean; hasActive?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-atria-gray-medium last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 font-inter font-semibold text-sm text-atria-text-dark"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {title}
          {hasActive && (
            <span className="w-2 h-2 rounded-full bg-atria-navy flex-shrink-0" aria-label="Filtro ativo" />
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-atria-text-gray transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CheckList helper ─────────────────────────────────────────────────────────
function CheckList({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              selected.includes(opt)
                ? "bg-atria-navy border-atria-navy"
                : "border-atria-gray-medium group-hover:border-atria-navy"
            }`}
            onClick={() => toggle(opt)}
          >
            {selected.includes(opt) && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="white">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            )}
          </div>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="sr-only" />
          <span className="font-inter text-sm text-atria-text-dark">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  filters, onChange, vehicles,
}: { filters: FilterState; onChange: (f: FilterState) => void; vehicles: Vehicle[] }) {
  const set = useCallback((patch: Partial<FilterState>) => onChange({ ...filters, ...patch }), [filters, onChange]);

  // Derived: all brands with counts
  const marcaOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => { counts[v.marca] = (counts[v.marca] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [vehicles]);

  const coresDisponiveis = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.cor));
    return [...set].filter((c) => c in COR_MAP);
  }, [vehicles]);

  const [marcaBusca, setMarcaBusca] = useState("");
  const filteredMarcas = marcaOptions.filter(([m]) =>
    m.toLowerCase().includes(marcaBusca.toLowerCase())
  );

  // Toggle helper
  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <div className="space-y-0">
      {/* ── Preço ── */}
      <FilterAccordion
        title="Preço"
        defaultOpen
        hasActive={filters.preco[0] > DEFAULT_RANGES.preco[0] || filters.preco[1] < DEFAULT_RANGES.preco[1]}
      >
        <PriceHistogram vehicles={vehicles} range={filters.preco} />
        <RangeSlider
          min={DEFAULT_RANGES.preco[0]}
          max={DEFAULT_RANGES.preco[1]}
          value={filters.preco}
          onChange={(v) => set({ preco: v })}
          step={5000}
          formatValue={fmt}
        />
      </FilterAccordion>

      {/* ── Marca ── */}
      <FilterAccordion title="Marca" defaultOpen hasActive={filters.marcas.length > 0}>
        <div className="relative mb-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-atria-text-gray" />
          <input
            type="text"
            placeholder="Buscar marca..."
            value={marcaBusca}
            onChange={(e) => setMarcaBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-atria-gray-medium rounded-lg font-inter text-xs outline-none focus:border-atria-navy transition-colors"
          />
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {filteredMarcas.map(([marca, count]) => (
            <label key={marca} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  filters.marcas.includes(marca)
                    ? "bg-atria-navy border-atria-navy"
                    : "border-atria-gray-medium group-hover:border-atria-navy"
                }`}
                onClick={() => set({ marcas: toggleArr(filters.marcas, marca) })}
              >
                {filters.marcas.includes(marca) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={filters.marcas.includes(marca)} onChange={() => set({ marcas: toggleArr(filters.marcas, marca) })} className="sr-only" />
              <span className="font-inter text-sm text-atria-text-dark flex-1">{marca}</span>
              <span className="font-inter text-xs text-atria-text-gray">({count})</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* ── Tipo de Carroceria ── */}
      <FilterAccordion title="Tipo" defaultOpen hasActive={filters.tipos.length > 0}>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => set({ tipos: toggleArr(filters.tipos, tipo) })}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 text-xs font-inter font-semibold transition-all ${
                filters.tipos.includes(tipo)
                  ? "border-atria-navy bg-atria-navy text-white"
                  : "border-atria-gray-medium text-atria-text-dark hover:border-atria-navy"
              }`}
              aria-pressed={filters.tipos.includes(tipo)}
            >
              <span className={filters.tipos.includes(tipo) ? "text-white" : "text-atria-text-gray"}>
                {TIPO_ICONS[tipo]}
              </span>
              {tipo}
            </button>
          ))}
        </div>
      </FilterAccordion>

      {/* ── Ano ── */}
      <FilterAccordion
        title="Ano"
        hasActive={filters.ano[0] > DEFAULT_RANGES.ano[0] || filters.ano[1] < DEFAULT_RANGES.ano[1]}
      >
        <RangeSlider
          min={DEFAULT_RANGES.ano[0]}
          max={DEFAULT_RANGES.ano[1]}
          value={filters.ano}
          onChange={(v) => set({ ano: v })}
          step={1}
          formatValue={(v) => String(v)}
        />
      </FilterAccordion>

      {/* ── Quilometragem ── */}
      <FilterAccordion
        title="Quilometragem"
        hasActive={filters.km[0] > DEFAULT_RANGES.km[0] || filters.km[1] < DEFAULT_RANGES.km[1]}
      >
        <RangeSlider
          min={DEFAULT_RANGES.km[0]}
          max={DEFAULT_RANGES.km[1]}
          value={filters.km}
          onChange={(v) => set({ km: v })}
          step={5000}
          formatValue={fmtKm}
        />
      </FilterAccordion>

      {/* ── Combustível ── */}
      <FilterAccordion title="Combustível" hasActive={filters.combustivel.length > 0}>
        <CheckList
          options={COMBUSTIVEIS}
          selected={filters.combustivel}
          onChange={(v) => set({ combustivel: v })}
        />
      </FilterAccordion>

      {/* ── Câmbio ── */}
      <FilterAccordion title="Câmbio" hasActive={filters.cambio.length > 0}>
        <CheckList
          options={CAMBIOS}
          selected={filters.cambio}
          onChange={(v) => set({ cambio: v })}
        />
      </FilterAccordion>

      {/* ── Cor ── */}
      <FilterAccordion title="Cor" hasActive={filters.cores.length > 0}>
        <div className="flex flex-wrap gap-2.5">
          {coresDisponiveis.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => set({ cores: toggleArr(filters.cores, cor) })}
              title={cor}
              aria-label={cor}
              aria-pressed={filters.cores.includes(cor)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                filters.cores.includes(cor)
                  ? "border-atria-navy scale-110 shadow-md"
                  : "border-white shadow hover:scale-105"
              }`}
              style={{ backgroundColor: COR_MAP[cor] }}
            />
          ))}
        </div>
      </FilterAccordion>

      {/* ── Portas ── */}
      <FilterAccordion title="Portas" hasActive={filters.portas.length > 0}>
        <div className="flex gap-2">
          {[2, 4].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set({ portas: toggleArr(filters.portas, p) })}
              aria-pressed={filters.portas.includes(p)}
              className={`flex-1 py-2.5 font-inter font-semibold text-sm rounded-lg border-2 transition-all ${
                filters.portas.includes(p)
                  ? "border-atria-navy bg-atria-navy text-white"
                  : "border-atria-gray-medium text-atria-text-dark hover:border-atria-navy"
              }`}
            >
              {p} portas
            </button>
          ))}
        </div>
      </FilterAccordion>
    </div>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
function ActiveFilters({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const chips = useMemo<ActiveChip[]>(() => {
    const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
    const result: ActiveChip[] = [];

    if (filters.busca) result.push({ label: `"${filters.busca}"`, onRemove: () => set({ busca: "" }) });
    if (filters.preco[0] > DEFAULT_RANGES.preco[0] || filters.preco[1] < DEFAULT_RANGES.preco[1])
      result.push({ label: `${fmt(filters.preco[0])} – ${fmt(filters.preco[1])}`, onRemove: () => set({ preco: [...DEFAULT_RANGES.preco] }) });
    filters.marcas.forEach((m) => result.push({ label: m, onRemove: () => set({ marcas: filters.marcas.filter((x) => x !== m) }) }));
    filters.tipos.forEach((t) => result.push({ label: t, onRemove: () => set({ tipos: filters.tipos.filter((x) => x !== t) }) }));
    if (filters.ano[0] > DEFAULT_RANGES.ano[0] || filters.ano[1] < DEFAULT_RANGES.ano[1])
      result.push({ label: `${filters.ano[0]}–${filters.ano[1]}`, onRemove: () => set({ ano: [...DEFAULT_RANGES.ano] }) });
    if (filters.km[0] > DEFAULT_RANGES.km[0] || filters.km[1] < DEFAULT_RANGES.km[1])
      result.push({ label: `${fmtKm(filters.km[0])} – ${fmtKm(filters.km[1])}`, onRemove: () => set({ km: [...DEFAULT_RANGES.km] }) });
    filters.combustivel.forEach((c) => result.push({ label: c, onRemove: () => set({ combustivel: filters.combustivel.filter((x) => x !== c) }) }));
    filters.cambio.forEach((c) => result.push({ label: c, onRemove: () => set({ cambio: filters.cambio.filter((x) => x !== c) }) }));
    filters.cores.forEach((c) => result.push({ label: c, onRemove: () => set({ cores: filters.cores.filter((x) => x !== c) }) }));
    filters.portas.forEach((p) => result.push({ label: `${p} portas`, onRemove: () => set({ portas: filters.portas.filter((x) => x !== p) }) }));

    return result;
  }, [filters, onChange]);

  if (!chips.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={chip.onRemove}
          className="flex items-center gap-1.5 bg-atria-navy/10 text-atria-navy text-xs font-inter font-semibold px-3 py-1.5 rounded-full hover:bg-atria-navy hover:text-white transition-all"
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}
      <button
        onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
        className="text-xs font-inter text-atria-text-gray hover:text-atria-navy underline ml-1"
      >
        Limpar tudo
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-atria-gray-medium animate-pulse">
      <div className="aspect-[4/3] bg-atria-gray-medium" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-atria-gray-medium rounded w-1/4" />
        <div className="h-5 bg-atria-gray-medium rounded w-3/4" />
        <div className="h-3 bg-atria-gray-medium rounded w-1/2" />
        <div className="h-7 bg-atria-gray-medium rounded w-2/5 mt-1" />
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
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-xl overflow-hidden border border-atria-gray-medium hover:shadow-lg transition-shadow"
      itemScope itemType="https://schema.org/Car"
    >
      <a href={`/veiculo/${v.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-atria-gray-light">
          {v.fotos?.[0] ? (
            <img
              src={v.fotos[0]}
              alt={`${titulo} – ${v.cor} – ${fmtKm(v.km)}`}
              width={800} height={600}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              itemProp="image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car size={48} className="text-atria-gray-medium" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {v.destaque && (
              <span className="bg-atria-yellow text-atria-navy text-xs font-inter font-bold uppercase px-2.5 py-1 rounded">Destaque</span>
            )}
            {v.tipo && (
              <span className="bg-atria-navy/80 text-white text-xs font-inter uppercase px-2.5 py-1 rounded">{v.tipo}</span>
            )}
          </div>
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-inter font-bold px-2.5 py-1 rounded">
            {v.ano}
          </span>
        </div>
      </a>
      <div className="p-5 pb-3">
        <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider mb-0.5">{v.marca}</p>
        <a href={`/veiculo/${v.slug}`}>
          <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark leading-tight mb-2 hover:text-atria-navy transition-colors" itemProp="name">
            {titulo}
          </h3>
        </a>
        <p className="font-inter text-sm text-atria-text-gray line-clamp-1 mb-3">{v.descricao}</p>
        <ul className="flex gap-3 flex-wrap mb-3" role="list">
          {[fmtKm(v.km), v.cambio, v.combustivel, v.portas ? `${v.portas} portas` : null]
            .filter(Boolean)
            .map((spec) => (
              <li key={spec} className="flex items-center gap-1 font-inter text-xs text-atria-text-gray">
                <span className="w-1 h-1 bg-atria-gray-medium rounded-full" />
                {spec}
              </li>
            ))}
        </ul>
        <p className="font-barlow-condensed font-black text-2xl text-atria-navy" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="price" content={String(v.preco)}>{fmt(v.preco)}</span>
          <meta itemProp="priceCurrency" content="BRL" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
        </p>
      </div>
      <div className="px-5 pb-5 flex gap-2 mt-2">
        <a
          href={waLink(`Olá! Vi o ${titulo} ${v.ano} por ${fmt(v.preco)} no estoque da Átria. Tenho interesse!`)}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-inter font-bold text-sm uppercase tracking-wider py-2.5 rounded text-center transition-colors"
        >
          QUERO ESSE
        </a>
        <a href={`/veiculo/${v.slug}`}
          className="px-4 py-2.5 border border-atria-gray-medium text-atria-text-gray hover:border-atria-navy hover:text-atria-navy font-inter text-sm font-semibold rounded transition-all text-center"
        >
          Detalhes
        </a>
      </div>
    </motion.article>
  );
}

// ─── Não Encontrou ────────────────────────────────────────────────────────────
function NaoEncontrou({ busca }: { busca: string }) {
  const [form, setForm] = useState({ nome: "", whatsapp: "", busca: busca });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await saveLead({ nome: form.nome, whatsapp: form.whatsapp, source: "estoque-nao-encontrou", query: form.busca });
    setSending(false);
    setDone(true);
    setTimeout(() => window.open(waLink(`Olá! Me chamo ${form.nome}. Não encontrei no estoque. Procuro: ${form.busca}`), "_blank"), 800);
  };

  return (
    <section className="bg-atria-gray-light rounded-2xl p-8 text-center max-w-2xl mx-auto mt-12">
      {done ? (
        <div>
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark">Recebemos! Abrindo WhatsApp...</h3>
        </div>
      ) : (
        <>
          <h3 className="font-barlow-condensed font-black text-2xl text-atria-text-dark mb-1.5">Não encontrou o que procura?</h3>
          <p className="font-inter text-atria-text-gray text-sm mb-5">Nossa equipe busca o veículo certo para você.</p>
          <form className="space-y-3 text-left" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Seu nome" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy" />
              <input type="tel" placeholder="WhatsApp" value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy" />
            </div>
            <input type="text" placeholder="O que você procura? Ex: SUV automático até R$ 150 mil"
              value={form.busca} onChange={(e) => setForm({ ...form, busca: e.target.value })} required
              className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy" />
            <button type="submit" disabled={sending} className="btn-navy w-full rounded-lg disabled:opacity-60">
              {sending ? "Enviando..." : "QUERO QUE ME AJUDEM A ENCONTRAR"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Estoque() {
  const [all, setAll] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load data
  useEffect(() => {
    getVehicles().then((v) => { setAll(v); setLoading(false); });
  }, []);

  // Read URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFilters((f) => ({
      ...f,
      busca: p.get("q") ?? "",
      tipos: p.get("tipo") ? [p.get("tipo")!] : [],
    }));
  }, []);

  // Sync URL on change
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.busca) p.set("q", filters.busca);
    if (filters.tipos.length === 1) p.set("tipo", filters.tipos[0]);
    if (filters.marcas.length) p.set("marca", filters.marcas.join(","));
    const url = `${window.location.pathname}${p.toString() ? "?" + p.toString() : ""}`;
    window.history.replaceState({}, "", url);
  }, [filters.busca, filters.tipos, filters.marcas]);

  // Filter + sort
  const filtered = useMemo(() => {
    let res = all.filter((v) => {
      if (filters.marcas.length && !filters.marcas.includes(v.marca)) return false;
      if (filters.tipos.length && !filters.tipos.includes(v.tipo ?? "")) return false;
      if (v.preco < filters.preco[0] || v.preco > filters.preco[1]) return false;
      if (v.ano < filters.ano[0] || v.ano > filters.ano[1]) return false;
      if (v.km < filters.km[0] || v.km > filters.km[1]) return false;
      if (filters.combustivel.length && !filters.combustivel.includes(v.combustivel)) return false;
      if (filters.cambio.length && !filters.cambio.includes(v.cambio)) return false;
      if (filters.cores.length && !filters.cores.includes(v.cor)) return false;
      if (filters.portas.length && !filters.portas.includes(v.portas ?? 4)) return false;
      const q = filters.busca.toLowerCase();
      if (q && !`${v.marca} ${v.modelo} ${v.titulo ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (filters.sort) {
      case "preco_asc": res = [...res].sort((a, b) => a.preco - b.preco); break;
      case "preco_desc": res = [...res].sort((a, b) => b.preco - a.preco); break;
      case "km_asc": res = [...res].sort((a, b) => a.km - b.km); break;
      default: res = [...res].sort((a, b) => +b.createdAt - +a.createdAt); break;
    }
    return res;
  }, [all, filters]);

  usePageSEO(all);
  const handleChange = useCallback((f: FilterState) => setFilters(f), []);

  const hasFilters = isFilterActive(filters);

  return (
    <>
      {/* Hero */}
      <header className="bg-atria-navy pt-24 pb-8">
        <div className="container mx-auto px-4">
          <p className="section-label mb-2">Campinas, SP</p>
          <h1 className="font-barlow-condensed font-black text-5xl md:text-6xl uppercase text-white leading-none">
            Nosso Estoque
          </h1>
          <p className="font-inter text-white/60 mt-2">
            {loading ? "Carregando…" : `${all.length} veículos disponíveis`}
          </p>
        </div>
      </header>

      {/* Top bar (mobile search + filter btn, desktop sort) */}
      <div className="sticky top-16 z-30 bg-white border-b border-atria-gray-medium shadow-sm">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Search (always visible) */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-atria-text-gray" />
            <input
              type="search"
              placeholder="Buscar marca ou modelo..."
              value={filters.busca}
              onChange={(e) => setFilters((f) => ({ ...f, busca: e.target.value }))}
              aria-label="Buscar veículos"
              className="w-full pl-9 pr-4 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm outline-none focus:border-atria-navy transition-colors"
            />
          </div>
          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-atria-gray-medium rounded-lg font-inter text-sm font-semibold text-atria-text-dark whitespace-nowrap"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-atria-navy" />}
          </button>
          {/* Sort (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <span className="font-inter text-sm text-atria-text-gray whitespace-nowrap">
              {loading ? "…" : `${filtered.length} veículo${filtered.length !== 1 ? "s" : ""}`}
            </span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))}
              aria-label="Ordenar por"
              className="border border-atria-gray-medium rounded-lg px-3 py-2.5 font-inter text-sm outline-none focus:border-atria-navy bg-white"
            >
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Layout: Sidebar + Grid */}
      <div className="container mx-auto px-4">
        <div className="flex gap-0 lg:gap-8 items-start py-6">

          {/* ── Desktop Sidebar ── */}
          <aside
            className="hidden lg:block w-[260px] shrink-0"
            aria-label="Filtros de busca"
          >
            <div className="sticky top-[112px] max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-barlow-condensed font-bold text-base text-atria-text-dark uppercase tracking-wider">
                  Filtros
                </span>
                {hasFilters && (
                  <button
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="font-inter text-xs text-atria-navy hover:underline"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
              <Sidebar filters={filters} onChange={handleChange} vehicles={all} />
            </div>
          </aside>

          {/* ── Grid ── */}
          <main className="flex-1 min-w-0" id="grid-veiculos">
            {/* Active chips */}
            <ActiveFilters filters={filters} onChange={handleChange} />

            {/* Mobile count + sort */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="font-inter text-sm text-atria-text-gray">
                {filtered.length} veículo{filtered.length !== 1 ? "s" : ""}
              </span>
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))}
                className="border border-atria-gray-medium rounded-lg px-3 py-2 font-inter text-sm outline-none bg-white"
              >
                {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" role="list">
                <AnimatePresence mode="popLayout">
                  {filtered.map((v) => (
                    <li key={v.id}><VehicleCard v={v} /></li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center py-16" role="status">
                <Car size={56} className="text-atria-gray-medium mx-auto mb-4" />
                <h2 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-2">
                  Nenhum veículo encontrado
                </h2>
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="font-inter text-sm text-atria-navy underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}

            <NaoEncontrou busca={filters.busca} />
          </main>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-atria-gray-medium">
                <span className="font-barlow-condensed font-bold text-lg uppercase tracking-wider">Filtros</span>
                <div className="flex items-center gap-3">
                  {hasFilters && (
                    <button onClick={() => { setFilters(EMPTY_FILTERS); }} className="font-inter text-xs text-atria-navy">
                      Limpar
                    </button>
                  )}
                  <button onClick={() => setDrawerOpen(false)} aria-label="Fechar filtros">
                    <X size={20} className="text-atria-text-gray" />
                  </button>
                </div>
              </div>
              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <Sidebar filters={filters} onChange={handleChange} vehicles={all} />
              </div>
              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-atria-gray-medium">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="btn-navy w-full rounded-lg"
                >
                  Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
