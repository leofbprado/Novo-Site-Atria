import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpDown, X, Car, ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { getVehicles, saveLead, vehiclePath, type Vehicle } from "@/lib/firestore";
import { brandLogoFor, brandDisplayName } from "@/lib/brandLogos";
import { getPrecoExibicao, calcularFaixaParcela, parcelaParaPreco, SIM_PRAZO } from "@/lib/preco";
import { TagBadge } from "@/components/TagBadge";

// ─── Constants ────────────────────────────────────────────────────────────────
const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (n: number) => `${n.toLocaleString("pt-BR")} km`;

const TIPOS = ["SUV", "Sedan", "Hatch", "Pickup"];
const COMBUSTIVEIS = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"];
const CAMBIOS = ["Automática", "Manual", "CVT"];

const SORT_OPTIONS = [
  { label: "Relevância", key: "recente" },
  { label: "Menor preço", key: "preco_asc" },
  { label: "Maior preço", key: "preco_desc" },
  { label: "Menor km", key: "km_asc" },
  { label: "Maior km", key: "km_desc" },
  { label: "Mais novo", key: "ano_desc" },
  { label: "Mais velho", key: "ano_asc" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

// Ilustrações dos tipos de carroceria — PNGs no R2 servidas via Cloudflare
// Image Transformations (format=auto negocia WebP/JPG pelo Accept header,
// width=320 dá folga pra retina agora que a imagem ocupa o botão inteiro).
const ICON_CF = "https://atriaveiculos.com/cdn-cgi/image";
const ICON_BASE = "https://icons.atriaveiculos.com";
const TIPO_ICONS: Record<string, string> = {
  SUV:    `${ICON_CF}/width=320,format=auto/${ICON_BASE}/suv-model.png`,
  Sedan:  `${ICON_CF}/width=320,format=auto/${ICON_BASE}/sedan-model.png`,
  Hatch:  `${ICON_CF}/width=320,format=auto/${ICON_BASE}/hatch-model.png`,
  Pickup: `${ICON_CF}/width=320,format=auto/${ICON_BASE}/pickup-model.png`,
};

// ─── Filter State ─────────────────────────────────────────────────────────────
interface FilterState {
  busca: string;
  preco: [number, number];
  marcas: string[];
  modelos: string[];
  tipos: string[];
  ano: [number, number];
  km: [number, number];
  combustivel: string[];
  cambio: string[];
  soPromocao: boolean;
  sort: SortKey;
}

const DEFAULT_RANGES = {
  preco: [0, 500000] as [number, number],
  ano: [2005, 2026] as [number, number],
  km: [0, 300000] as [number, number],
};

const EMPTY_FILTERS: FilterState = {
  busca: "",
  preco: [...DEFAULT_RANGES.preco],
  marcas: [],
  modelos: [],
  tipos: [],
  ano: [...DEFAULT_RANGES.ano],
  km: [...DEFAULT_RANGES.km],
  combustivel: [],
  cambio: [],
  soPromocao: false,
  sort: "recente",
};

function isFilterActive(f: FilterState): boolean {
  return (
    f.busca !== "" ||
    f.marcas.length > 0 ||
    (f.modelos ?? []).length > 0 ||
    f.tipos.length > 0 ||
    f.combustivel.length > 0 ||
    f.cambio.length > 0 ||
    f.soPromocao ||
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
import { useSEO } from "@/hooks/useSEO";
import { SITE_URL, ROUTES } from "@/lib/constants";

function usePageSEO(vehicles: Vehicle[]) {
  useSEO({
    title: "Estoque de Carros Usados e Seminovos em Campinas SP | Átria Veículos",
    description: "Confira nosso estoque de veículos seminovos em Campinas. SUVs, sedãs, hatches e picapes das melhores marcas com financiamento facilitado.",
    path: ROUTES.estoque,
  });

  useEffect(() => {
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
          "offers": { "@type": "Offer", "price": getPrecoExibicao(v).precoFinal, "priceCurrency": "BRL", "availability": "https://schema.org/InStock" },
          "url": `${SITE_URL}/campinas-sp/${v.slug}`,
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

// ─── MinMaxInputs ─ pares de input numérico abaixo dos sliders pra digitar ──
// valores exatos. Estado compartilhado com o slider via `value`/`onChange`.
// Placeholder mostra o bound (min/max) quando o usuário não definiu nada.
function MinMaxInputs({
  value, min, max, step = 1, onChange, prefix, suffix,
}: {
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  onChange: (v: [number, number]) => void;
  prefix?: string;
  suffix?: string;
}) {
  const Field = ({ which }: { which: "min" | "max" }) => {
    const idx = which === "min" ? 0 : 1;
    const val = value[idx];
    const showValue = which === "min" ? (val > min ? val : "") : (val < max ? val : "");
    const placeholder = String(which === "min" ? min : max);
    return (
      <div className="flex items-center rounded-lg border border-atria-gray-medium focus-within:border-atria-navy transition-colors overflow-hidden">
        {prefix && <span className="pl-2.5 pr-1 font-inter text-sm text-atria-text-gray">{prefix}</span>}
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={showValue}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (which === "min") {
              const v = raw > 0 ? Math.min(raw, value[1]) : min;
              onChange([Math.max(min, v), value[1]]);
            } else {
              const v = raw > 0 ? Math.min(raw, max) : max;
              onChange([value[0], Math.max(value[0], v)]);
            }
          }}
          className={`w-full py-2 ${prefix ? "" : "pl-2.5"} ${suffix ? "" : "pr-2"} font-inter text-sm text-atria-text-dark outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        {suffix && <span className="pl-1 pr-2.5 font-inter text-sm text-atria-text-gray">{suffix}</span>}
      </div>
    );
  };
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <label className="block">
        <span className="block text-[11px] uppercase tracking-wider text-atria-text-gray font-semibold mb-1">Mínimo</span>
        <Field which="min" />
      </label>
      <label className="block">
        <span className="block text-[11px] uppercase tracking-wider text-atria-text-gray font-semibold mb-1">Máximo</span>
        <Field which="max" />
      </label>
    </div>
  );
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
        <div className="absolute w-full h-1 bg-atria-gray-medium rounded-full" />
        <div
          className="absolute h-1 bg-atria-navy rounded-full"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="rs-thumb"
          style={{ zIndex: atMax ? 5 : 3 }}
          aria-label="Valor mínimo"
        />
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
function PriceHistogram({ vehicles, range, max }: { vehicles: Vehicle[]; range: [number, number]; max: number }) {
  const BINS = 14;
  const allMin = 0;
  const allMax = max;
  const binW = (allMax - allMin) / BINS;

  const counts = useMemo(() =>
    Array.from({ length: BINS }, (_, i) => {
      const lo = allMin + i * binW;
      const hi = lo + binW;
      // Última barra inclui o limite superior (carro mais caro)
      return vehicles.filter((v) => {
        const p = getPrecoExibicao(v).precoFinal;
        return p >= lo && (i === BINS - 1 ? p <= hi : p < hi);
      }).length;
    }),
    [vehicles, binW, allMin]
  );

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="flex items-end gap-px h-12 mb-1" aria-hidden="true">
      {counts.map((count, i) => {
        const binLo = allMin + i * binW;
        const binHi = binLo + binW;
        const active = binHi >= range[0] && binLo <= range[1];
        const heightPct = count === 0 ? 4 : Math.max(12, (count / maxCount) * 100);
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-colors duration-150 ${
              count === 0 ? "bg-atria-gray-medium/40" : active ? "bg-atria-navy" : "bg-atria-gray-medium"
            }`}
            style={{ height: `${heightPct}%` }}
            title={`${fmtBins(binLo)}–${fmtBins(binHi)}: ${count} veículo${count !== 1 ? "s" : ""}`}
          />
        );
      })}
    </div>
  );
}

function fmtBins(v: number): string {
  if (v >= 1000) return `R$ ${Math.round(v / 1000)}k`;
  return `R$ ${v}`;
}

// ─── PriceFilterContent ───────────────────────────────────────────────────────
// Drill panel do filtro de Preço. Duas abas:
// - "Faixa": min/max via slider/histograma/inputs (controle direto da faixa)
// - "Parcela": entrada + parcela mensal → calcula faixa de preço via fórmula
//   compartilhada com Home/Financiamento (calcularFaixaParcela).
// Toggle "Só ofertas" mora aqui dentro também — convive conceitualmente com
// preço já que mexe na mesma dimensão (o que o cliente paga).
function PriceFilterContent({
  filters, onChange, vehicles, precoMaxStock,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  vehicles: Vehicle[];
  precoMaxStock: number;
}) {
  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );
  const [tab, setTab] = useState<"faixa" | "parcela">("faixa");

  // Estado da aba Parcela. Inicializa a partir da faixa atual: usa o ponto
  // médio da faixa pra deduzir uma parcela razoável com entrada padrão.
  const [entrada, setEntrada] = useState<number>(10000);
  const [parcela, setParcela] = useState<number>(() => {
    const meio = (filters.preco[0] + Math.min(filters.preco[1], precoMaxStock)) / 2;
    return parcelaParaPreco(meio, 10000);
  });

  // Quando muda entrada/parcela, calcula a faixa e aplica direto no filtro.
  useEffect(() => {
    if (tab !== "parcela") return;
    const { precoMin, precoMax } = calcularFaixaParcela(entrada, parcela);
    const clampedMax = Math.min(precoMax, precoMaxStock);
    if (filters.preco[0] !== precoMin || filters.preco[1] !== clampedMax) {
      set({ preco: [precoMin, clampedMax] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrada, parcela, tab, precoMaxStock]);

  const faixaPreview = calcularFaixaParcela(entrada, parcela);
  const faixaDefault = filters.preco[0] === 0 && filters.preco[1] >= precoMaxStock;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex p-1 bg-atria-gray-light rounded-full">
        <button
          type="button"
          onClick={() => setTab("faixa")}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-inter font-semibold transition-colors ${
            tab === "faixa" ? "bg-white text-atria-navy shadow-sm" : "text-atria-text-gray hover:text-atria-text-dark"
          }`}
        >
          Faixa
        </button>
        <button
          type="button"
          onClick={() => setTab("parcela")}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-inter font-semibold transition-colors ${
            tab === "parcela" ? "bg-white text-atria-navy shadow-sm" : "text-atria-text-gray hover:text-atria-text-dark"
          }`}
        >
          Parcela
        </button>
      </div>

      {tab === "faixa" ? (
        <>
          <PriceHistogram vehicles={vehicles} range={filters.preco} max={precoMaxStock} />
          <RangeSlider
            min={0}
            max={precoMaxStock}
            value={[filters.preco[0], Math.min(filters.preco[1], precoMaxStock)]}
            onChange={(v) => set({ preco: v })}
            step={10000}
            formatValue={fmt}
          />
          <MinMaxInputs
            value={[filters.preco[0], Math.min(filters.preco[1], precoMaxStock)]}
            min={0}
            max={precoMaxStock}
            step={1000}
            onChange={(v) => set({ preco: v })}
            prefix="R$"
          />
          {!faixaDefault && (
            <button
              type="button"
              onClick={() => set({ preco: [0, precoMaxStock] })}
              className="w-full py-2.5 rounded-full border border-atria-gray-medium text-sm font-inter font-semibold text-atria-text-gray hover:border-atria-navy hover:text-atria-navy transition-colors"
            >
              Limpar faixa
            </button>
          )}
        </>
      ) : (
        <div className="space-y-5">
          <p className="text-xs font-inter text-atria-text-gray leading-relaxed">
            Estimativa baseada em {SIM_PRAZO}× sem entrada extra. Filtra carros que cabem no orçamento mensal.
          </p>

          {/* Entrada */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="text-[11px] uppercase tracking-wider text-atria-text-gray font-semibold">Entrada</label>
              <span className="font-barlow-condensed font-bold text-base text-atria-navy">{fmt(entrada)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={entrada}
              onChange={(e) => setEntrada(Number(e.target.value))}
              className="w-full accent-atria-navy"
            />
            <div className="flex justify-between text-[10px] font-inter text-atria-text-gray mt-0.5">
              <span>{fmt(0)}</span><span>{fmt(50000)}</span>
            </div>
          </div>

          {/* Parcela */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="text-[11px] uppercase tracking-wider text-atria-text-gray font-semibold">Parcela mensal</label>
              <span className="font-barlow-condensed font-bold text-base text-atria-navy">{fmt(parcela)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={parcela}
              onChange={(e) => setParcela(Number(e.target.value))}
              className="w-full accent-atria-navy"
            />
            <div className="flex justify-between text-[10px] font-inter text-atria-text-gray mt-0.5">
              <span>{fmt(500)}</span><span>{fmt(5000)}</span>
            </div>
          </div>

          {/* Preview da faixa calculada */}
          <div className="bg-atria-gray-light rounded-lg p-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-atria-text-gray font-semibold mb-1">Faixa de preço estimada</p>
            <p className="font-barlow-condensed font-bold text-lg text-atria-navy">
              {fmt(faixaPreview.precoMin)} <span className="text-atria-text-gray font-normal text-sm">a</span> {fmt(Math.min(faixaPreview.precoMax, precoMaxStock))}
            </p>
          </div>
        </div>
      )}

      {/* Toggle "Só ofertas" — mora dentro de Preço pois é dimensão do mesmo eixo */}
      <button
        type="button"
        onClick={() => set({ soPromocao: !filters.soPromocao })}
        aria-pressed={filters.soPromocao}
        className="w-full flex items-center justify-between py-3 px-4 border border-atria-gray-medium rounded-lg hover:border-atria-navy transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          <span className="font-inter font-semibold text-sm text-atria-text-dark">Só ofertas</span>
          {filters.soPromocao && <span className="w-1.5 h-1.5 rounded-full bg-red-600" aria-hidden="true" />}
        </span>
        <span
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
            filters.soPromocao ? "bg-red-600" : "bg-atria-gray-medium"
          }`}
          aria-hidden="true"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              filters.soPromocao ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}

// ─── CheckList ────────────────────────────────────────────────────────────────
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

// ─── CheckListWithCount ───────────────────────────────────────────────────────
function CheckListWithCount({
  options, selected, onChange, labelFor,
}: { options: [string, number][]; selected: string[]; onChange: (v: string[]) => void; labelFor?: (v: string) => string }) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  return (
    <div className="space-y-1.5">
      {options.map(([opt, count]) => (
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
          <span className="font-inter text-sm text-atria-text-dark flex-1">{labelFor ? labelFor(opt) : opt}</span>
          <span className="font-inter text-xs text-atria-text-gray">({count})</span>
        </label>
      ))}
    </div>
  );
}

// ─── BrandLogoCard ────────────────────────────────────────────────────────────
function BrandLogoCard({
  name, logo, selected, onToggle,
}: { name: string; logo: string; selected: boolean; onToggle: () => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-150 ${
        selected
          ? "border-atria-navy bg-blue-50"
          : "border-atria-gray-medium hover:border-atria-navy bg-white"
      }`}
    >
      <div className="h-12 flex items-center justify-center">
        {imgError ? (
          <span className="font-barlow-condensed font-black text-2xl text-atria-navy">
            {name.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <img
            src={logo}
            alt={`Logo ${name}`}
            className="max-h-12 max-w-[72px] object-contain"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span className={`font-inter text-[11px] font-semibold leading-tight text-center ${selected ? "text-atria-navy" : "text-atria-text-dark"}`}>
        {name}
      </span>
    </button>
  );
}

// ─── MarcaFilter ─────────────────────────────────────────────────────────────
function MarcaFilter({
  vehicles, selected, onChange,
}: { vehicles: Vehicle[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((x) => x !== name) : [...selected, name]);

  // All brands with counts (from actual data)
  const allBrandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => { counts[v.marca] = (counts[v.marca] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [vehicles]);

  // Top 6 marcas com maior volume no estoque atual
  const topBrands = useMemo(() => allBrandCounts.slice(0, 6).map(([name]) => ({
    name,
    logo: brandLogoFor(name),
  })), [allBrandCounts]);

  return (
    <div>
      {/* Popular grid 2×3 — top 6 do estoque */}
      <p className="font-inter text-[11px] font-semibold uppercase tracking-wider text-atria-text-gray mb-2">
        Mais populares
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {topBrands.map((b) => (
          <BrandLogoCard
            key={b.name}
            name={brandDisplayName(b.name)}
            logo={b.logo}
            selected={selected.includes(b.name)}
            onToggle={() => toggle(b.name)}
          />
        ))}
      </div>

      {/* All brands with counts */}
      <p className="font-inter text-[11px] font-semibold uppercase tracking-wider text-atria-text-gray mb-2">
        Todas as marcas
      </p>
      <CheckListWithCount
        options={allBrandCounts}
        selected={selected}
        onChange={onChange}
        labelFor={brandDisplayName}
      />
    </div>
  );
}

// ─── ModeloFilter ─────────────────────────────────────────────────────────────
function ModeloFilter({
  vehicles, selectedMarcas, selectedModelos, onChange,
}: {
  vehicles: Vehicle[];
  selectedMarcas: string[];
  selectedModelos: string[];
  onChange: (v: string[]) => void;
}) {
  // Available models (filtered by brand selection)
  const modeloCounts = useMemo(() => {
    const source = selectedMarcas.length
      ? vehicles.filter((v) => selectedMarcas.includes(v.marca))
      : vehicles;
    const counts: Record<string, number> = {};
    source.forEach((v) => { counts[v.modelo] = (counts[v.modelo] ?? 0) + 1; });
    return counts;
  }, [vehicles, selectedMarcas]);

  // Group by first letter
  const grouped = useMemo(() => {
    const entries = Object.entries(modeloCounts).sort(([a], [b]) => a.localeCompare(b));
    const groups: Record<string, [string, number][]> = {};
    entries.forEach(([modelo, count]) => {
      const letter = modelo[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push([modelo, count]);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [modeloCounts]);

  const toggle = (val: string) =>
    onChange(selectedModelos.includes(val) ? selectedModelos.filter((x) => x !== val) : [...selectedModelos, val]);

  if (!grouped.length) {
    return <p className="font-inter text-sm text-atria-text-gray italic">Selecione uma marca primeiro</p>;
  }

  return (
    <div className="space-y-3">
      {grouped.map(([letter, modelos]) => (
        <div key={letter}>
          <p className="font-inter text-xs font-bold text-atria-text-gray uppercase mb-1">{letter}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {modelos.map(([modelo, count]) => (
              <label key={modelo} className="flex items-center gap-1.5 cursor-pointer group min-w-0">
                <div
                  className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedModelos.includes(modelo)
                      ? "bg-atria-navy border-atria-navy"
                      : "border-atria-gray-medium group-hover:border-atria-navy"
                  }`}
                  onClick={() => toggle(modelo)}
                >
                  {selectedModelos.includes(modelo) && (
                    <svg width="8" height="7" viewBox="0 0 10 8" fill="white">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={selectedModelos.includes(modelo)} onChange={() => toggle(modelo)} className="sr-only" />
                <span className="font-inter text-xs text-atria-text-dark truncate">{modelo}</span>
                <span className="font-inter text-[10px] text-atria-text-gray flex-shrink-0">({count})</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filter drill-down navigation ─────────────────────────────────────────────
type FilterKey = 'preco' | 'marca' | 'modelo' | 'tipos' | 'ano' | 'km' | 'combustivel' | 'cambio';

const FILTER_LIST: { key: FilterKey; title: string }[] = [
  { key: 'preco', title: 'Preço' },
  { key: 'marca', title: 'Marca' },
  { key: 'modelo', title: 'Modelo' },
  { key: 'tipos', title: 'Tipo de carroceria' },
  { key: 'ano', title: 'Ano' },
  { key: 'km', title: 'Quilometragem' },
  { key: 'combustivel', title: 'Combustível' },
  { key: 'cambio', title: 'Câmbio' },
];

function isActiveFor(key: FilterKey, f: FilterState, precoMaxStock: number): boolean {
  switch (key) {
    case 'preco': return f.preco[0] > 0 || f.preco[1] < precoMaxStock || f.soPromocao;
    case 'marca': return f.marcas.length > 0;
    case 'modelo': return (f.modelos ?? []).length > 0;
    case 'tipos': return f.tipos.length > 0;
    case 'ano': return f.ano[0] > DEFAULT_RANGES.ano[0] || f.ano[1] < DEFAULT_RANGES.ano[1];
    case 'km': return f.km[0] > DEFAULT_RANGES.km[0] || f.km[1] < DEFAULT_RANGES.km[1];
    case 'combustivel': return f.combustivel.length > 0;
    case 'cambio': return f.cambio.length > 0;
  }
}

function summaryFor(key: FilterKey, f: FilterState, precoMaxStock: number): string {
  const summarizeMulti = (arr: string[]): string => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return `${arr[0]} +${arr.length - 1}`;
  };
  switch (key) {
    case 'preco': {
      const faixaDefault = f.preco[0] === 0 && f.preco[1] >= precoMaxStock;
      const faixa = faixaDefault ? '' : `${fmt(f.preco[0])} – ${fmt(Math.min(f.preco[1], precoMaxStock))}`;
      if (f.soPromocao && faixa) return `${faixa} · só ofertas`;
      if (f.soPromocao) return 'Só ofertas';
      return faixa;
    }
    case 'marca': {
      if (f.marcas.length === 0) return '';
      if (f.marcas.length === 1) return brandDisplayName(f.marcas[0]);
      return `${brandDisplayName(f.marcas[0])} +${f.marcas.length - 1}`;
    }
    case 'modelo': return summarizeMulti(f.modelos ?? []);
    case 'tipos': return summarizeMulti(f.tipos);
    case 'ano': {
      if (f.ano[0] === DEFAULT_RANGES.ano[0] && f.ano[1] === DEFAULT_RANGES.ano[1]) return '';
      return `${f.ano[0]} – ${f.ano[1]}`;
    }
    case 'km': {
      if (f.km[0] === DEFAULT_RANGES.km[0] && f.km[1] === DEFAULT_RANGES.km[1]) return '';
      return `${fmtKm(f.km[0])} – ${fmtKm(f.km[1])}`;
    }
    case 'combustivel': return summarizeMulti(f.combustivel);
    case 'cambio': return summarizeMulti(f.cambio);
  }
}

// ─── FilterIndex ──────────────────────────────────────────────────────────────
// Lista de filtros (índice). Cada linha mostra título + dot se ativo + summary +
// chevron pra direita. Click "drilla" pra dentro do filtro escolhido.
function FilterIndex({
  filters, precoMaxStock, onSelectKey, focusKey,
}: {
  filters: FilterState;
  precoMaxStock: number;
  onSelectKey: (key: FilterKey) => void;
  focusKey: FilterKey | null;
}) {
  const refs = useRef<Partial<Record<FilterKey, HTMLButtonElement | null>>>({});
  useEffect(() => {
    if (focusKey) refs.current[focusKey]?.focus();
  }, [focusKey]);

  return (
    <div className="flex flex-col">
      {FILTER_LIST.map(({ key, title }) => {
        const active = isActiveFor(key, filters, precoMaxStock);
        const summary = summaryFor(key, filters, precoMaxStock);
        const ariaLabel = active && summary
          ? `${title}, atualmente ${summary}`
          : `${title}, sem filtro aplicado`;
        return (
          <button
            key={key}
            ref={(el) => { refs.current[key] = el; }}
            type="button"
            onClick={() => onSelectKey(key)}
            aria-label={ariaLabel}
            className="w-full min-h-[48px] flex items-center justify-between py-3 px-1 -mx-1 border-b border-atria-gray-medium last:border-b-0 hover:bg-atria-gray-light/40 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-atria-navy focus-visible:ring-offset-2 rounded-sm"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-inter font-semibold text-sm text-atria-text-dark">
                {title}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-atria-navy flex-shrink-0" aria-hidden="true" />
              )}
            </span>
            <span className="flex items-center gap-1.5 ml-2 min-w-0">
              {summary && (
                <span className="font-inter text-xs text-atria-text-gray truncate max-w-[160px]">
                  {summary}
                </span>
              )}
              <ChevronRight size={16} className="text-atria-text-gray flex-shrink-0" aria-hidden="true" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── FilterDrillPanel ─────────────────────────────────────────────────────────
// Painel de um filtro só. Header "Voltar para todos os filtros" + título +
// conteúdo (reusa MarcaFilter, RangeSlider, etc.).
function FilterDrillPanel({
  activeKey, filters, onChange, vehicles, precoMaxStock, onBack,
}: {
  activeKey: FilterKey;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  vehicles: Vehicle[];
  precoMaxStock: number;
  onBack: () => void;
}) {
  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );
  const toggleArr = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const def = FILTER_LIST.find((f) => f.key === activeKey)!;
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    backRef.current?.focus();
  }, [activeKey]);

  let content: React.ReactNode = null;
  switch (activeKey) {
    case 'preco':
      content = (
        <PriceFilterContent
          filters={filters}
          onChange={onChange}
          vehicles={vehicles}
          precoMaxStock={precoMaxStock}
        />
      );
      break;
    case 'marca':
      content = (
        <MarcaFilter
          vehicles={vehicles}
          selected={filters.marcas}
          onChange={(v) => set({ marcas: v, modelos: [] })}
        />
      );
      break;
    case 'modelo':
      content = (
        <ModeloFilter
          vehicles={vehicles}
          selectedMarcas={filters.marcas}
          selectedModelos={filters.modelos ?? []}
          onChange={(v) => set({ modelos: v })}
        />
      );
      break;
    case 'tipos':
      content = (
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((tipo) => {
            const selected = filters.tipos.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => set({ tipos: toggleArr(filters.tipos, tipo) })}
                aria-pressed={selected}
                className="flex flex-col items-center gap-1.5 transition-all"
              >
                <div className={`w-full aspect-square rounded-xl overflow-hidden bg-[#e0edf7] transition-all ${
                  selected
                    ? "ring-2 ring-atria-navy ring-offset-2 ring-offset-white"
                    : "hover:opacity-90"
                }`}>
                  <img
                    src={TIPO_ICONS[tipo]}
                    alt={`Ilustração ${tipo}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className={`text-[11px] font-inter font-semibold ${
                  selected ? "text-atria-navy" : "text-atria-text-dark"
                }`}>
                  {tipo}
                </span>
              </button>
            );
          })}
        </div>
      );
      break;
    case 'ano':
      content = (
        <>
          <RangeSlider
            min={DEFAULT_RANGES.ano[0]}
            max={DEFAULT_RANGES.ano[1]}
            value={filters.ano}
            onChange={(v) => set({ ano: v })}
            step={1}
            formatValue={(v) => String(v)}
          />
          <MinMaxInputs
            value={filters.ano}
            min={DEFAULT_RANGES.ano[0]}
            max={DEFAULT_RANGES.ano[1]}
            step={1}
            onChange={(v) => set({ ano: v })}
          />
        </>
      );
      break;
    case 'km':
      content = (
        <>
          <RangeSlider
            min={DEFAULT_RANGES.km[0]}
            max={DEFAULT_RANGES.km[1]}
            value={filters.km}
            onChange={(v) => set({ km: v })}
            step={5000}
            formatValue={fmtKm}
          />
          <MinMaxInputs
            value={filters.km}
            min={DEFAULT_RANGES.km[0]}
            max={DEFAULT_RANGES.km[1]}
            step={1000}
            onChange={(v) => set({ km: v })}
            suffix="km"
          />
        </>
      );
      break;
    case 'combustivel':
      content = (
        <CheckList
          options={COMBUSTIVEIS}
          selected={filters.combustivel}
          onChange={(v) => set({ combustivel: v })}
        />
      );
      break;
    case 'cambio':
      content = (
        <CheckList
          options={CAMBIOS}
          selected={filters.cambio}
          onChange={(v) => set({ cambio: v })}
        />
      );
      break;
  }

  return (
    <div className="flex flex-col">
      <button
        ref={backRef}
        type="button"
        onClick={onBack}
        className="self-start min-h-[40px] flex items-center gap-1 -ml-1 px-1 mb-2 font-inter text-xs font-semibold text-atria-navy hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-atria-navy focus-visible:ring-offset-2 rounded-sm"
        aria-label="Voltar para a lista de filtros"
      >
        <ChevronLeft size={14} />
        Voltar para todos os filtros
      </button>
      <h3 className="font-inter font-semibold text-base text-atria-text-dark mb-3">
        {def.title}
      </h3>
      <div>{content}</div>
    </div>
  );
}

// ─── Sidebar (drill-down router) ──────────────────────────────────────────────
function Sidebar({
  filters, onChange, vehicles,
}: { filters: FilterState; onChange: (f: FilterState) => void; vehicles: Vehicle[] }) {
  const [activeFilterKey, setActiveFilterKey] = useState<FilterKey | null>(null);
  const [focusKey, setFocusKey] = useState<FilterKey | null>(null);
  const reduceMotion = useReducedMotion();

  const precoMaxStock = useMemo(() => {
    const maxPreco = vehicles.reduce((m, v) => {
      const p = getPrecoExibicao(v).precoFinal;
      return p > m ? p : m;
    }, 0);
    return Math.max(10000, Math.ceil(maxPreco / 10000) * 10000);
  }, [vehicles]);

  // Esc dentro do drill volta pra índice (intercepta antes de outros handlers)
  useEffect(() => {
    if (!activeFilterKey) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setFocusKey(activeFilterKey);
        setActiveFilterKey(null);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [activeFilterKey]);

  const slide = reduceMotion ? 0 : 12;
  const dur = reduceMotion ? 0 : 0.18;

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {activeFilterKey === null ? (
          <motion.div
            key="index"
            initial={{ x: -slide, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -slide, opacity: 0 }}
            transition={{ duration: dur, ease: "easeOut" }}
          >
            <FilterIndex
              filters={filters}
              precoMaxStock={precoMaxStock}
              onSelectKey={(key) => {
                setFocusKey(null);
                setActiveFilterKey(key);
              }}
              focusKey={focusKey}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`drill-${activeFilterKey}`}
            initial={{ x: slide, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slide, opacity: 0 }}
            transition={{ duration: dur, ease: "easeOut" }}
          >
            <FilterDrillPanel
              activeKey={activeFilterKey}
              filters={filters}
              onChange={onChange}
              vehicles={vehicles}
              precoMaxStock={precoMaxStock}
              onBack={() => {
                setFocusKey(activeFilterKey);
                setActiveFilterKey(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
function ActiveFilters({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const chips = useMemo<ActiveChip[]>(() => {
    const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
    const result: ActiveChip[] = [];

    if (filters.busca) result.push({ label: `"${filters.busca}"`, onRemove: () => set({ busca: "" }) });
    if (filters.soPromocao) result.push({ label: "Só ofertas", onRemove: () => set({ soPromocao: false }) });
    if (filters.preco[0] > DEFAULT_RANGES.preco[0] || filters.preco[1] < DEFAULT_RANGES.preco[1])
      result.push({ label: `${fmt(filters.preco[0])} – ${fmt(filters.preco[1])}`, onRemove: () => set({ preco: [...DEFAULT_RANGES.preco] }) });
    filters.marcas.forEach((m) => result.push({ label: m, onRemove: () => set({ marcas: filters.marcas.filter((x) => x !== m) }) }));
    (filters.modelos ?? []).forEach((m) => result.push({ label: m, onRemove: () => set({ modelos: (filters.modelos ?? []).filter((x) => x !== m) }) }));
    filters.tipos.forEach((t) => result.push({ label: t, onRemove: () => set({ tipos: filters.tipos.filter((x) => x !== t) }) }));
    if (filters.ano[0] > DEFAULT_RANGES.ano[0] || filters.ano[1] < DEFAULT_RANGES.ano[1])
      result.push({ label: `${filters.ano[0]}–${filters.ano[1]}`, onRemove: () => set({ ano: [...DEFAULT_RANGES.ano] }) });
    if (filters.km[0] > DEFAULT_RANGES.km[0] || filters.km[1] < DEFAULT_RANGES.km[1])
      result.push({ label: `${fmtKm(filters.km[0])} – ${fmtKm(filters.km[1])}`, onRemove: () => set({ km: [...DEFAULT_RANGES.km] }) });
    filters.combustivel.forEach((c) => result.push({ label: c, onRemove: () => set({ combustivel: filters.combustivel.filter((x) => x !== c) }) }));
    filters.cambio.forEach((c) => result.push({ label: c, onRemove: () => set({ cambio: filters.cambio.filter((x) => x !== c) }) }));

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
  const { precoFinal, precoCheio, emPromocao } = getPrecoExibicao(v);
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
      <a href={vehiclePath(v)} className="block">
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
          {(() => {
            // Regra: máx 1 badge. Oferta (auto pelo preço) ganha; senão, tag manual.
            const primeiraTag = (v.tags || []).find((t) => t !== "oferta");
            const tagFinal = emPromocao ? "oferta" : primeiraTag ?? null;
            if (!tagFinal) return null;
            return (
              <div className="absolute top-3 left-3">
                <TagBadge tag={tagFinal} />
              </div>
            );
          })()}
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-inter font-bold px-2.5 py-1 rounded">
            {v.ano}
          </span>
        </div>
        <div className="p-5 pb-3">
          <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider mb-0.5">{v.marca}</p>
          <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark leading-tight mb-2 group-hover:text-atria-navy transition-colors" itemProp="name">
            {titulo}
          </h3>
          {v.versao && <p className="font-inter text-sm text-atria-text-gray mb-1">{v.versao}</p>}
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
          <div className="flex items-baseline gap-2 flex-wrap" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            {precoCheio && (
              <span className="font-inter text-sm text-atria-text-gray line-through">{fmt(precoCheio)}</span>
            )}
            <p className="font-barlow-condensed font-black text-2xl text-atria-navy">
              <span itemProp="price" content={String(precoFinal)}>{fmt(precoFinal)}</span>
            </p>
            <meta itemProp="priceCurrency" content="BRL" />
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>
        </div>
      </a>
      <div className="px-5 pb-5 flex gap-2 mt-2">
        <a
          href={waLink(`Olá! Vi o ${titulo} ${v.ano} por ${fmt(precoFinal)} no estoque da Átria. Tenho interesse!`)}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 text-white font-inter font-bold text-sm uppercase tracking-wider py-2.5 rounded text-center transition-colors"
        >
          QUERO ESSE
        </a>
        <a href={vehiclePath(v)}
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
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const topBarRef = useRef<HTMLDivElement>(null);

  // Show floating pill when top bar scrolls out of view
  useEffect(() => {
    const el = topBarRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowPill(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    getVehicles().then((v) => { setAll(v); setLoading(false); });
  }, []);

  // Read URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const min = Number(p.get("precoMin"));
    const max = Number(p.get("precoMax"));
    setFilters((f) => ({
      ...f,
      busca: p.get("q") ?? "",
      tipos: (() => {
        const raw = p.get("tipo");
        if (!raw) return [];
        // Normaliza pra case canônico (TIPOS) — URL vem lowercase do hero/footer
        const canonical = TIPOS.find((t) => t.toLowerCase() === raw.toLowerCase());
        return canonical ? [canonical] : [raw];
      })(),
      marcas: p.get("marca") ? p.get("marca")!.split(",") : [],
      cambio: (() => {
        const raw = p.get("cambio");
        if (!raw) return [];
        const canonical = CAMBIOS.find((c) => c.toLowerCase() === raw.toLowerCase());
        return canonical ? [canonical] : [];
      })(),
      preco: [
        Number.isFinite(min) && min > 0 ? min : f.preco[0],
        Number.isFinite(max) && max > 0 ? max : f.preco[1],
      ],
    }));
    // Deep-link mobile: ?openFilters=1 abre o drawer no mount (só se mobile).
    // Usado pela pill "Marcas" no hero pra economizar clique no mobile.
    if (p.get("openFilters") === "1" && typeof window !== "undefined" && window.innerWidth < 1024) {
      setDrawerOpen(true);
    }
  }, []);

  // Sync URL on change
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.busca) p.set("q", filters.busca);
    if (filters.tipos.length === 1) p.set("tipo", filters.tipos[0]);
    if (filters.marcas.length) p.set("marca", filters.marcas.join(","));
    if ((filters.modelos ?? []).length) p.set("modelo", (filters.modelos ?? []).join(","));
    if (filters.cambio.length === 1) p.set("cambio", filters.cambio[0]);
    const url = `${window.location.pathname}${p.toString() ? "?" + p.toString() : ""}`;
    window.history.replaceState({}, "", url);
  }, [filters.busca, filters.tipos, filters.marcas, filters.modelos, filters.cambio]);

  // Filter change flash — feedback visual pra usuário saber que filtro recomputou
  const [filterFlash, setFilterFlash] = useState(false);
  const filtersSig = useMemo(() => JSON.stringify(filters), [filters]);
  const firstFiltersRenderRef = useRef(true);
  useEffect(() => {
    if (firstFiltersRenderRef.current) {
      firstFiltersRenderRef.current = false;
      return;
    }
    setFilterFlash(true);
    const t = setTimeout(() => setFilterFlash(false), 450);
    return () => clearTimeout(t);
  }, [filtersSig]);

  // Filter + sort
  const filtered = useMemo(() => {
    let res = all.filter((v) => {
      if (filters.marcas.length && !filters.marcas.includes(v.marca)) return false;
      if ((filters.modelos ?? []).length && !(filters.modelos ?? []).includes(v.modelo)) return false;
      if (filters.tipos.length) {
        const vTipo = (v.tipo || "").toLowerCase();
        if (!filters.tipos.some((t) => t.toLowerCase() === vTipo)) return false;
      }
      const precoVisivel = getPrecoExibicao(v).precoFinal;
      if (precoVisivel > 0 && (precoVisivel < filters.preco[0] || precoVisivel > filters.preco[1])) return false;
      if (filters.soPromocao && !getPrecoExibicao(v).emPromocao) return false;
      if (v.ano > 0 && (v.ano < filters.ano[0] || v.ano > filters.ano[1])) return false;
      if (v.km >= 0 && (v.km < filters.km[0] || v.km > filters.km[1])) return false;
      if (filters.combustivel.length && !filters.combustivel.includes(v.combustivel)) return false;
      if (filters.cambio.length && !filters.cambio.includes(v.cambio)) return false;
      const q = filters.busca.toLowerCase();
      if (q && !`${v.marca} ${v.modelo} ${v.titulo ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (filters.sort) {
      case "preco_asc": res = [...res].sort((a, b) => getPrecoExibicao(a).precoFinal - getPrecoExibicao(b).precoFinal); break;
      case "preco_desc": res = [...res].sort((a, b) => getPrecoExibicao(b).precoFinal - getPrecoExibicao(a).precoFinal); break;
      case "km_asc": res = [...res].sort((a, b) => a.km - b.km); break;
      case "km_desc": res = [...res].sort((a, b) => b.km - a.km); break;
      case "ano_desc": res = [...res].sort((a, b) => b.ano - a.ano); break;
      case "ano_asc": res = [...res].sort((a, b) => a.ano - b.ano); break;
      default: res = [...res].sort((a, b) => +a.createdAt - +b.createdAt); break;
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
            Estoque de Seminovos em Campinas
          </h1>
          <p className="font-inter text-white/60 mt-2">
            {loading ? "Carregando…" : `${all.length} veículos disponíveis`}
          </p>
        </div>
      </header>

      {/* Top bar */}
      <div ref={topBarRef} className="sticky top-16 z-30 bg-white border-b border-atria-gray-medium shadow-sm">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
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
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex lg:hidden items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 text-atria-navy rounded-full font-inter text-sm font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-atria-navy" />}
          </button>
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <span className="font-inter text-sm text-atria-text-gray whitespace-nowrap flex items-center gap-1.5">
              {filterFlash && !loading && (
                <span className="w-1.5 h-1.5 rounded-full bg-atria-navy animate-pulse" aria-hidden="true" />
              )}
              {loading ? "…" : (
                <>
                  <motion.span
                    key={filtered.length}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="font-semibold text-atria-text-dark tabular-nums"
                  >
                    {filtered.length}
                  </motion.span>
                  {` veículo${filtered.length !== 1 ? "s" : ""}`}
                </>
              )}
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

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0" aria-label="Filtros de busca">
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

          {/* Grid */}
          <main className="flex-1 min-w-0" id="grid-veiculos">
            <ActiveFilters filters={filters} onChange={handleChange} />

            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="font-inter text-sm text-atria-text-gray flex items-center gap-1.5">
                {filterFlash && (
                  <span className="w-1.5 h-1.5 rounded-full bg-atria-navy animate-pulse" aria-hidden="true" />
                )}
                <motion.span
                  key={filtered.length}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="font-semibold text-atria-text-dark tabular-nums"
                >
                  {filtered.length}
                </motion.span>
                {` veículo${filtered.length !== 1 ? "s" : ""}`}
              </span>
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

      {/* Mobile Floating Pill */}
      <div
        className="fixed z-[9999] md:hidden left-1/2 -translate-x-1/2 transition-all duration-300"
        style={{
          bottom: showPill ? "20px" : "-60px",
          opacity: showPill ? 1 : 0,
          pointerEvents: showPill ? "auto" : "none",
        }}
      >
        <div className="flex items-center bg-atria-navy rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] px-2 py-1.5 gap-1">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-inter text-sm font-semibold text-white active:bg-white/10 transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filtros
            {hasFilters && <span className="w-2 h-2 rounded-full bg-atria-gold" />}
          </button>
          <div className="w-px h-5 bg-white/30" />
          <button
            onClick={() => setSortSheetOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-inter text-sm font-semibold text-white active:bg-white/10 transition-colors"
          >
            <ArrowUpDown size={14} />
            Ordenar
          </button>
        </div>
      </div>

      {/* Sort Bottom Sheet (mobile) */}
      <AnimatePresence>
        {sortSheetOpen && (
          <>
            <motion.div
              key="sort-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setSortSheetOpen(false)}
            />
            <motion.div
              key="sort-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark">Ordenar por</h3>
                <button
                  onClick={() => setSortSheetOpen(false)}
                  className="text-atria-text-gray hover:text-atria-text-dark transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-5 pb-6 space-y-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setFilters((f) => ({ ...f, sort: opt.key }));
                      setSortSheetOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors ${
                      filters.sort === opt.key
                        ? "bg-atria-navy/5"
                        : "hover:bg-atria-gray-light"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        filters.sort === opt.key
                          ? "border-atria-navy"
                          : "border-atria-gray-medium"
                      }`}
                    >
                      {filters.sort === opt.key && (
                        <div className="w-2.5 h-2.5 rounded-full bg-atria-navy" />
                      )}
                    </div>
                    <span className={`font-inter text-sm ${
                      filters.sort === opt.key
                        ? "font-semibold text-atria-navy"
                        : "text-atria-text-dark"
                    }`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-atria-gray-medium">
                <span className="font-barlow-condensed font-bold text-lg uppercase tracking-wider">Filtros</span>
                <div className="flex items-center gap-3">
                  {hasFilters && (
                    <button onClick={() => setFilters(EMPTY_FILTERS)} className="font-inter text-xs text-atria-navy">
                      Limpar
                    </button>
                  )}
                  <button onClick={() => setDrawerOpen(false)} aria-label="Fechar filtros">
                    <X size={20} className="text-atria-text-gray" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <Sidebar filters={filters} onChange={handleChange} vehicles={all} />
              </div>
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
