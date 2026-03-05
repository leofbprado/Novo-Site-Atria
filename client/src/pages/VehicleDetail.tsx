import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronDown, Calendar,
  Gauge, Fuel, Settings, Palette, DoorOpen, ShieldCheck,
  Star, Phone, CheckCircle, Car, MapPin, Mountain,
  Cog, Users, TrendingDown,
} from "lucide-react";
import { getVehicleBySlug, getVehicles, saveLead, type Vehicle } from "@/lib/firestore";

// ---- Helpers ----------------------------------------------------------------
const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (n: number) => `${n.toLocaleString("pt-BR")} km`;

function calcParcela(preco: number, entradaPct: number, meses: number): number {
  const r = 0.015;
  const P = preco * (1 - entradaPct / 100);
  return Math.round((P * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1));
}

// ---- SEO --------------------------------------------------------------------
function useVehicleSEO(v: Vehicle | null) {
  useEffect(() => {
    if (!v) return;
    const title = `${v.marca} ${v.modelo} ${v.versao ?? ""} ${v.ano} | Atria Veiculos`;
    document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", `${v.marca} ${v.modelo} ${v.ano}, ${fmtKm(v.km)}, ${fmt(v.preco)}. ${v.descricao.slice(0, 120)}`);
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg && v.fotos[0]) ogImg.setAttribute("content", v.fotos[0]);

    const old = document.getElementById("schema-vehicle");
    if (old) old.remove();
    const schema = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": `${v.marca} ${v.modelo} ${v.ano}`,
      "brand": { "@type": "Brand", "name": v.marca },
      "model": v.modelo,
      "vehicleModelDate": String(v.ano),
      "color": v.cor,
      "mileageFromOdometer": { "@type": "QuantitativeValue", "value": v.km, "unitCode": "KMT" },
      "image": v.fotos,
      "description": v.descricao,
      "offers": {
        "@type": "Offer",
        "price": v.preco,
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": { "@type": "AutoDealer", "name": "Atria Veiculos" },
      },
    };
    const s = document.createElement("script");
    s.id = "schema-vehicle"; s.type = "application/ld+json";
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
    return () => { document.getElementById("schema-vehicle")?.remove(); };
  }, [v]);
}

// ---- AI Badge Generator -----------------------------------------------------
interface AIBadge {
  icon: React.ReactNode;
  label: string;
}

function generateBadges(v: Vehicle): AIBadge[] {
  const badges: AIBadge[] = [];
  const versaoLower = (v.versao ?? "").toLowerCase();
  const opcionaisLower = (v.opcionais ?? []).map(o => o.toLowerCase()).join(" ");
  const descLower = v.descricao.toLowerCase();
  const vehicleAge = Math.max(1, new Date().getFullYear() - v.ano);
  const kmPerYear = Math.round(v.km / vehicleAge);

  if (v.combustivel === "Diesel" || versaoLower.includes("diesel") || versaoLower.includes("tdi")) {
    badges.push({ icon: <Fuel size={14} />, label: "Torque premium" });
  }
  if (v.km < 50000 && v.km >= 30000) {
    badges.push({ icon: <TrendingDown size={14} />, label: `${kmPerYear.toLocaleString("pt-BR")} km/ano` });
  }
  if (v.km < 30000) {
    badges.push({ icon: <TrendingDown size={14} />, label: "Baixa km" });
  }
  if (versaoLower.includes("4x4") || opcionaisLower.includes("4x4") || descLower.includes("4x4")) {
    badges.push({ icon: <Mountain size={14} />, label: "Tracao integral" });
  }
  if (v.cambio === "Autom\u00e1tica" || v.cambio === "CVT") {
    badges.push({ icon: <Cog size={14} />, label: "Cambio automatico" });
  }
  if (descLower.includes("7 lugares") || opcionaisLower.includes("7 lugares")) {
    badges.push({ icon: <Users size={14} />, label: "7 lugares" });
  }
  if (v.ano >= 2022) {
    badges.push({ icon: <Calendar size={14} />, label: "Seminovo recente" });
  }
  if (v.tipo === "SUV" || v.tipo === "Pickup") {
    badges.push({ icon: <Car size={14} />, label: "Versatil" });
  }

  return badges.slice(0, 3);
}

// ---- Photo Gallery ----------------------------------------------------------
function PhotoGallery({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = (delta: number) => {
    setDirection(delta);
    setCurrent((c) => (c + delta + fotos.length) % fotos.length);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-atria-gray-light group">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.img
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            src={fotos[current]}
            alt={`${titulo} - foto ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {fotos.length > 1 && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Proxima foto"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-inter font-semibold px-2.5 py-1 rounded-full">
          {current + 1} / {fotos.length}
        </span>
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((src, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-atria-navy" : "border-transparent opacity-60 hover:opacity-90"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Opcionais Accordion ----------------------------------------------------
const CATEGORIAS_OPCIONAIS = [
  { label: "Conforto", keywords: ["ar-condicionado", "direcao", "vidros", "travas", "banco", "teto solar", "volante", "retrovisor", "piloto", "ventilado", "aquecido"] },
  { label: "Seguranca", keywords: ["airbag", "abs", "sensor de estacion", "camera", "freio", "estabilidade", "isofix", "lane", "safety", "cmbs", "lka", "pcs", "frenagem"] },
  { label: "Multimidia", keywords: ["tela", "bluetooth", "usb", "apple carplay", "android auto", "som", "mylink", "uconnect", "mmi", "mbux", "sync", "discover", "carplay"] },
  { label: "Exterior", keywords: ["farol", "rodas", "spoiler", "pintura", "escape", "tracao", "bloqueio"] },
];

function categorizarOpcionais(opcionais: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  CATEGORIAS_OPCIONAIS.forEach((cat) => { result[cat.label] = []; });
  result["Outros"] = [];

  opcionais.forEach((opt) => {
    const lower = opt.toLowerCase();
    let matched = false;
    for (const cat of CATEGORIAS_OPCIONAIS) {
      if (cat.keywords.some((kw) => lower.includes(kw))) {
        result[cat.label].push(opt);
        matched = true;
        break;
      }
    }
    if (!matched) result["Outros"].push(opt);
  });

  return result;
}

function OpcionaisSection({ opcionais }: { opcionais: string[] }) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ Conforto: true });
  const categorized = useMemo(() => categorizarOpcionais(opcionais), [opcionais]);
  const toggleCat = (cat: string) => setOpenCats((o) => ({ ...o, [cat]: !o[cat] }));

  const allCats = [...CATEGORIAS_OPCIONAIS.map((c) => c.label), "Outros"].filter(
    (cat) => (categorized[cat] ?? []).length > 0
  );

  return (
    <div className="border border-atria-gray-medium rounded-xl overflow-hidden divide-y divide-atria-gray-medium">
      {allCats.map((cat) => (
        <div key={cat}>
          <button
            type="button"
            onClick={() => toggleCat(cat)}
            className="w-full flex items-center justify-between px-5 py-4 font-inter font-semibold text-sm text-atria-text-dark hover:bg-atria-gray-light transition-colors"
          >
            <span className="flex items-center gap-2">
              {cat}
              <span className="text-xs font-normal text-atria-text-gray">
                ({categorized[cat].length})
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-atria-text-gray transition-transform duration-200 ${openCats[cat] ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {openCats[cat] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {categorized[cat].map((opt) => (
                    <div key={opt} className="flex items-center gap-2 font-inter text-sm text-atria-text-dark">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      {opt}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ---- Sticky Price Panel (right column) --------------------------------------
function PricePanel({ v }: { v: Vehicle }) {
  const [agendarDone, setAgendarDone] = useState(false);
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  const parcela60 = calcParcela(v.preco, 20, 60);

  const handleAgendar = async () => {
    await saveLead({ source: "vehicle-agendar", whatsapp: "", query: titulo, dados: { slug: v.slug, preco: v.preco } });
    setAgendarDone(true);
    setTimeout(() => {
      window.open(waLink(`Ola! Gostaria de agendar uma visita para ver o ${titulo} ${v.ano} (${fmt(v.preco)}). Qual a disponibilidade?`), "_blank");
    }, 300);
  };

  return (
    <div className="bg-white border border-atria-gray-medium rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider">{v.marca}</p>
          <h2 className="font-barlow-condensed font-black text-2xl text-atria-text-dark leading-tight">
            {v.marca} {v.modelo}
          </h2>
          {v.versao && (
            <p className="font-inter text-sm text-atria-text-gray mt-0.5">{v.versao}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <p className="font-barlow-condensed font-black text-4xl text-atria-navy leading-none">
            {fmt(v.preco)}
          </p>
          <p className="font-inter text-sm text-atria-text-gray mt-1">
            ou a partir de{" "}
            <strong className="text-atria-text-dark">{fmt(parcela60)}/mes</strong>
            {" "}em 60x
          </p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={waLink(`Ola! Vi o ${titulo} ${v.ano} por ${fmt(v.preco)} no site da Atria Veiculos e tenho interesse! Codigo: ${v.slug}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-xl transition-colors flex items-center justify-center gap-2 block text-center shadow-lg shadow-green-500/20"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          QUERO ESSA {v.marca.toUpperCase()} {v.modelo.toUpperCase()}!
        </a>

        {/* Schedule visit */}
        <button
          onClick={handleAgendar}
          disabled={agendarDone}
          className={`w-full border-2 font-inter font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            agendarDone
              ? "border-green-500 text-green-600 bg-green-50"
              : "border-atria-gray-medium text-atria-text-dark hover:border-atria-navy hover:text-atria-navy"
          }`}
        >
          {agendarDone ? (
            <><CheckCircle size={16} /> Agendamento enviado!</>
          ) : (
            <><Calendar size={16} /> Agendar visita presencial</>
          )}
        </button>

        {/* Scroll to financing */}
        <button
          onClick={() => document.getElementById("financiamento")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full font-inter text-sm text-atria-navy hover:text-atria-navy-dark underline underline-offset-2 transition-colors py-1"
        >
          Simular financiamento com CPF
        </button>

        {/* Trust seals */}
        <div className="border-t border-atria-gray-medium pt-4 space-y-2.5">
          {[
            { icon: <ShieldCheck size={16} className="text-green-500" />, text: "Veiculo inspecionado com laudo" },
            { icon: <Star size={16} className="text-atria-yellow" />, text: "Garantia de 90 dias" },
            { icon: <CheckCircle size={16} className="text-atria-navy" />, text: "Documentacao em dia" },
            { icon: <Phone size={16} className="text-atria-navy" />, text: "Suporte pos-venda" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              {item.icon}
              <span className="font-inter text-xs text-atria-text-gray">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Ficha Tecnica with IA subtexts -----------------------------------------
function FichaTecnica({ v }: { v: Vehicle }) {
  const versaoLower = (v.versao ?? "").toLowerCase();
  const vehicleAge = Math.max(1, new Date().getFullYear() - v.ano);
  const kmPerYear = Math.round(v.km / vehicleAge);

  const motorLabel = v.versao
    ? v.versao.replace(/^.*?(\d[\d.]*\s*(?:T(?:urbo)?(?:\s*Diesel)?|TSI|TFSI|TDI|TDCi|VTEC)[^\s]*).*$/i, "$1").trim()
    : v.combustivel;
  const motorFallback = motorLabel === v.versao ? v.combustivel : motorLabel;

  function motorSubtext(): string | null {
    if (v.combustivel === "Diesel" || versaoLower.includes("diesel"))
      return "Economia em viagens longas";
    if (versaoLower.includes("turbo") || versaoLower.includes("tsi") || versaoLower.includes("tfsi"))
      return "Potencia com eficiencia";
    return null;
  }

  function kmSubtext(): string | null {
    if (v.km < 30000) return `~${kmPerYear.toLocaleString("pt-BR")} km/ano - uso muito conservador`;
    if (v.km < 50000) return `~${kmPerYear.toLocaleString("pt-BR")} km/ano - uso conservador`;
    return null;
  }

  function cambioSubtext(): string | null {
    if (v.cambio === "Autom\u00e1tica") return "Conforto no transito urbano";
    if (v.cambio === "CVT") return "Transicoes suaves, economia otimizada";
    return null;
  }

  function combustivelSubtext(): string | null {
    if (v.combustivel === "Diesel") return "Menor custo por km rodado";
    if (v.combustivel === "Flex") return "Flexibilidade na bomba";
    if (v.combustivel === "H\u00edbrido" || v.combustivel === "El\u00e9trico") return "Mobilidade sustentavel";
    return null;
  }

  const specs = [
    { icon: <Fuel size={16} />, label: "Motor", value: motorFallback, sub: motorSubtext() },
    { icon: <Gauge size={16} />, label: "Quilometragem", value: fmtKm(v.km), sub: kmSubtext() },
    { icon: <Settings size={16} />, label: "Cambio", value: v.cambio, sub: cambioSubtext() },
    { icon: <Fuel size={16} />, label: "Combustivel", value: v.combustivel, sub: combustivelSubtext() },
    { icon: <Palette size={16} />, label: "Cor", value: v.cor, sub: null },
    { icon: <DoorOpen size={16} />, label: "Portas", value: v.portas ? `${v.portas} portas` : "-", sub: null },
  ];

  return (
    <section>
      <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-4 uppercase tracking-wide">
        Ficha Tecnica
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {specs.map((s) => (
          <div key={s.label} className="flex items-start gap-3">
            <span className="text-atria-navy mt-0.5 flex-shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="font-inter text-xs text-atria-text-gray">{s.label}</p>
              <p className="font-inter text-sm font-semibold text-atria-text-dark">{s.value}</p>
              {s.sub && (
                <p className="font-inter text-xs text-atria-text-gray mt-0.5 italic">{s.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Financing Section (Credere Plugin) -------------------------------------
function FinancingSection({ v }: { v: Vehicle }) {
  return (
    <section id="financiamento">
      <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-1 uppercase tracking-wide">
        Simule seu financiamento
      </h2>
      <p className="font-inter text-sm text-atria-text-gray mb-5">
        Pre-aprovacao em 30 segundos com a Credere
      </p>

      {/* Credere widget container - DO NOT CHANGE */}
      <div
        id="credere-pnp"
        data-marca={v.marca}
        data-modelo={v.modelo}
        data-ano={String(v.ano)}
        data-preco={String(v.preco)}
      />
    </section>
  );
}

// ---- Compact Lead Capture ---------------------------------------------------
function CompactLeadCapture({ v }: { v: Vehicle }) {
  const [form, setForm] = useState({ email: "", telefone: "" });
  const [sent, setSent] = useState(false);
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.telefone) return;
    await saveLead({
      source: "vehicle-comparativo-ia",
      whatsapp: form.telefone,
      query: titulo,
      dados: { email: form.email, slug: v.slug, preco: v.preco },
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-[#F0F4FF] border border-[#D0DCFF] rounded-xl px-5 py-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
        <p className="font-inter text-sm text-atria-text-dark">Comparativo enviado para seu e-mail!</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F0F4FF] border border-[#D0DCFF] rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Gauge size={18} className="text-[#001A8C]" />
        <span className="font-inter font-semibold text-sm text-atria-text-dark">Compare este veiculo</span>
        <span className="font-inter text-xs text-atria-text-gray ml-1">- Receba um comparativo com concorrentes diretos por email</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
        <input
          type="email"
          placeholder="Seu e-mail"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="flex-1 min-w-[160px] bg-white border border-[#D0DCFF] rounded-lg px-3 py-2 font-inter text-sm text-atria-text-dark placeholder-atria-text-gray/50 focus:outline-none focus:border-atria-navy transition-colors"
          required
        />
        <input
          type="tel"
          placeholder="Seu telefone"
          value={form.telefone}
          onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
          className="flex-1 min-w-[140px] bg-white border border-[#D0DCFF] rounded-lg px-3 py-2 font-inter text-sm text-atria-text-dark placeholder-atria-text-gray/50 focus:outline-none focus:border-atria-navy transition-colors"
          required
        />
        <button
          type="submit"
          className="bg-atria-navy hover:bg-atria-navy-dark text-white font-inter font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

// ---- Similar Card -----------------------------------------------------------
function SimilarCard({ v }: { v: Vehicle }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  return (
    <a
      href={`/veiculo/${v.slug}`}
      className="group bg-white border border-atria-gray-medium rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
    >
      <div className="aspect-[4/3] overflow-hidden bg-atria-gray-light">
        {v.fotos[0] ? (
          <img
            src={v.fotos[0]}
            alt={titulo}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={36} className="text-atria-gray-medium" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider mb-0.5">{v.marca}</p>
        <p className="font-barlow-condensed font-bold text-lg text-atria-text-dark leading-tight group-hover:text-atria-navy transition-colors">{titulo}</p>
        <p className="font-inter text-xs text-atria-text-gray mt-1">{v.ano} &middot; {fmtKm(v.km)}</p>
        <p className="font-barlow-condensed font-black text-xl text-atria-navy mt-2">{fmt(v.preco)}</p>
      </div>
    </a>
  );
}

// ---- Mobile Sticky Bar ------------------------------------------------------
function MobileStickyBar({ v }: { v: Vehicle }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-atria-gray-medium z-40 px-4 py-3 flex items-center gap-3 shadow-lg">
      <div className="flex-1 min-w-0">
        <p className="font-inter text-xs text-atria-text-gray truncate">{titulo} {v.ano}</p>
        <p className="font-barlow-condensed font-black text-xl text-atria-navy leading-tight">{fmt(v.preco)}</p>
      </div>
      <a
        href={waLink(`Ola! Vi o ${titulo} ${v.ano} por ${fmt(v.preco)} no site da Atria. Tenho interesse!`)}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white font-inter font-bold text-sm uppercase px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
      >
        QUERO ESSE
      </a>
    </div>
  );
}

// ---- Store Locations Footer -------------------------------------------------
function StoreLocations() {
  const stores = [
    { name: "Atria Veiculos - Campinas", address: "Av. John Boyd Dunlop, 3900 - Jd. Ipaussurama, Campinas - SP" },
    { name: "Atria Veiculos - Valinhos", address: "Rod. Anhanguera km 86 - Valinhos - SP" },
  ];

  return (
    <section className="bg-atria-gray-light rounded-2xl p-8">
      <h2 className="font-barlow-condensed font-black text-2xl text-atria-text-dark mb-6 uppercase">
        Visite nossas lojas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stores.map((store) => (
          <div key={store.name} className="flex items-start gap-3">
            <MapPin size={20} className="text-atria-navy flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-inter font-semibold text-sm text-atria-text-dark">{store.name}</p>
              <p className="font-inter text-sm text-atria-text-gray mt-0.5">{store.address}</p>
            </div>
          </div>
        ))}
      </div>
      <a
        href={waLink("Ola! Gostaria de agendar uma visita presencial na loja. Qual a disponibilidade?")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 bg-atria-navy hover:bg-atria-navy-dark text-white font-inter font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
      >
        <Calendar size={16} />
        Agendar Visita
      </a>
    </section>
  );
}

// ---- Page -------------------------------------------------------------------
export default function VehicleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getVehicleBySlug(slug), getVehicles()]).then(([v, all]) => {
      if (!v) setNotFound(true);
      else setVehicle(v);
      setAllVehicles(all);
      setLoading(false);
    });
  }, [slug]);

  useVehicleSEO(vehicle);

  // Load Credere widget script after vehicle data is in the DOM
  useEffect(() => {
    if (!vehicle) return;
    const CREDERE_SRC = "https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js";
    const old = document.querySelector(`script[src="${CREDERE_SRC}"]`);
    if (old) old.remove();
    const timer = setTimeout(() => {
      const s = document.createElement("script");
      s.src = CREDERE_SRC;
      s.async = true;
      document.body.appendChild(s);
    }, 500);
    return () => {
      clearTimeout(timer);
      document.querySelector(`script[src="${CREDERE_SRC}"]`)?.remove();
    };
  }, [vehicle]);

  const similar = useMemo(() => {
    if (!vehicle) return [];
    return allVehicles
      .filter((v) => v.id !== vehicle.id && (v.marca === vehicle.marca || v.tipo === vehicle.tipo))
      .slice(0, 4);
  }, [vehicle, allVehicles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Carregando veiculo">
        <div className="w-10 h-10 rounded-full border-4 border-atria-gray-medium border-t-atria-navy animate-spin" />
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Car size={56} className="text-atria-gray-medium" />
        <h1 className="font-barlow-condensed font-black text-3xl text-atria-text-dark">Veiculo nao encontrado</h1>
        <p className="font-inter text-atria-text-gray">Este veiculo pode ter sido vendido ou o link esta incorreto.</p>
        <a href="/estoque" className="btn-navy rounded-xl mt-2">Ver estoque completo</a>
      </div>
    );
  }

  const titulo = vehicle.titulo ?? `${vehicle.marca} ${vehicle.modelo}`;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-atria-gray-light border-b border-atria-gray-medium">
        <nav className="container mx-auto px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 font-inter text-sm text-atria-text-gray flex-wrap">
            <li><a href="/" className="hover:text-atria-navy transition-colors">Inicio</a></li>
            <li className="opacity-40">/</li>
            <li><a href="/estoque" className="hover:text-atria-navy transition-colors">Estoque</a></li>
            <li className="opacity-40">/</li>
            <li className="text-atria-text-dark font-semibold truncate max-w-[200px]">{titulo}</li>
          </ol>
        </nav>
      </div>

      {/* ============ HERO: 70/30 Layout ============ */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN (70%) */}
          <div className="w-full lg:w-[70%] space-y-8 min-w-0">
            {/* Gallery */}
            <PhotoGallery fotos={vehicle.fotos} titulo={titulo} />

            {/* Title + AI Badges */}
            <div>
              <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider">{vehicle.marca}</p>
              <h1 className="font-barlow-condensed font-black text-3xl text-atria-text-dark leading-tight">
                {vehicle.marca} {vehicle.modelo}
              </h1>
              {vehicle.versao && (
                <p className="font-inter text-sm text-atria-text-gray mt-1">{vehicle.versao}</p>
              )}
              {/* AI Badges */}
              <div className="flex gap-2 flex-wrap mt-3">
                {generateBadges(vehicle).map((badge, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-[#E8EFFF] text-[#001A8C] font-inter text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                Sobre o veiculo
              </h2>
              <p className="font-inter text-base text-atria-text-dark leading-relaxed">{vehicle.descricao}</p>
            </section>

            {/* Ficha Tecnica */}
            <FichaTecnica v={vehicle} />

            {/* Opcionais */}
            {vehicle.opcionais && vehicle.opcionais.length > 0 && (
              <section>
                <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                  Opcionais e equipamentos
                </h2>
                <OpcionaisSection opcionais={vehicle.opcionais} />
              </section>
            )}

            {/* Compact Lead Capture */}
            <CompactLeadCapture v={vehicle} />

            {/* Financing / Credere */}
            <FinancingSection v={vehicle} />
          </div>

          {/* RIGHT COLUMN (30%) - Sticky */}
          <aside className="hidden lg:block w-[30%] shrink-0">
            <div className="sticky top-[80px]">
              <PricePanel v={vehicle} />
            </div>
          </aside>
        </div>

        {/* Similar Vehicles */}
        {similar.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase mb-6">
              Voce tambem pode gostar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((v) => <SimilarCard key={v.id} v={v} />)}
            </div>
          </motion.section>
        )}

        {/* Store Locations */}
        <div className="mt-12">
          <StoreLocations />
        </div>

        {/* Bottom CTA */}
        <section className="mt-12 bg-atria-navy rounded-2xl p-8 text-center text-white">
          <h2 className="font-barlow-condensed font-black text-3xl mb-2">Nao encontrou o que procura?</h2>
          <p className="font-inter text-white/70 mb-5">Nossa equipe encontra o veiculo ideal para voce.</p>
          <a
            href={waLink("Ola! Nao encontrei o veiculo que procuro no estoque. Podem me ajudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl transition-colors"
          >
            Falar com um consultor
          </a>
        </section>
      </div>

      {/* Mobile price + CTA bar */}
      <MobileStickyBar v={vehicle} />

      {/* Mobile: price panel below fold */}
      <div className="lg:hidden container mx-auto px-4 pb-8">
        <PricePanel v={vehicle} />
      </div>
    </>
  );
}
