import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronDown, Calendar,
  Gauge, Fuel, Settings, Palette, DoorOpen, ShieldCheck,
  Star, Phone, CheckCircle, Car, MapPin, Zap, Mountain,
  Cog, Users, TrendingDown, Mail, User,
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

// ---- AI Insights Generator --------------------------------------------------
interface AIInsight {
  icon: React.ReactNode;
  techLabel: string;
  humanLabel: string;
}

function generateInsights(v: Vehicle): AIInsight[] {
  const insights: AIInsight[] = [];
  const versaoLower = (v.versao ?? "").toLowerCase();
  const descLower = v.descricao.toLowerCase();
  const opcionaisLower = (v.opcionais ?? []).map(o => o.toLowerCase()).join(" ");

  // Diesel / Turbo Diesel
  if (v.combustivel === "Diesel" || versaoLower.includes("diesel") || versaoLower.includes("tdi")) {
    insights.push({
      icon: <Fuel size={22} className="text-[#001A8C]" />,
      techLabel: `Motor ${v.combustivel}${versaoLower.includes("turbo") ? " Turbo" : ""}`,
      humanLabel: "Ideal para torque em subidas e economia em viagens longas",
    });
  }

  // Low KM
  if (v.km < 50000) {
    const kmPerYear = Math.round(v.km / Math.max(1, new Date().getFullYear() - v.ano));
    insights.push({
      icon: <TrendingDown size={22} className="text-[#001A8C]" />,
      techLabel: fmtKm(v.km),
      humanLabel: `Equivale a apenas ${kmPerYear.toLocaleString("pt-BR")} km/ano - uso muito conservador`,
    });
  }

  // 4x4
  if (versaoLower.includes("4x4") || opcionaisLower.includes("4x4") || descLower.includes("4x4")) {
    insights.push({
      icon: <Mountain size={22} className="text-[#001A8C]" />,
      techLabel: "Tracao 4x4",
      humanLabel: "Versatilidade para cidade e off-road",
    });
  }

  // Automatic
  if (v.cambio === "Autom\u00e1tica" || v.cambio === "CVT") {
    insights.push({
      icon: <Cog size={22} className="text-[#001A8C]" />,
      techLabel: `Cambio ${v.cambio}`,
      humanLabel: "Conforto total no dia a dia, sem estresse no transito",
    });
  }

  // 7 seats
  if (descLower.includes("7 lugares") || opcionaisLower.includes("7 lugares")) {
    insights.push({
      icon: <Users size={22} className="text-[#001A8C]" />,
      techLabel: "7 Lugares",
      humanLabel: "Configuracao perfeita para familias grandes",
    });
  }

  // SUV
  if (v.tipo === "SUV") {
    insights.push({
      icon: <Car size={22} className="text-[#001A8C]" />,
      techLabel: `SUV ${v.marca}`,
      humanLabel: "Posicao elevada de direcao com seguranca e visibilidade",
    });
  }

  // Turbo (non-diesel)
  if (v.combustivel !== "Diesel" && (versaoLower.includes("turbo") || versaoLower.includes("tsi") || versaoLower.includes("tfsi"))) {
    insights.push({
      icon: <Zap size={22} className="text-[#001A8C]" />,
      techLabel: "Motor Turbo",
      humanLabel: "Potencia quando voce precisa, economia quando nao precisa",
    });
  }

  // Portas
  if (v.portas && v.portas >= 4) {
    insights.push({
      icon: <DoorOpen size={22} className="text-[#001A8C]" />,
      techLabel: `${v.portas} portas`,
      humanLabel: "Acesso facil para todos os passageiros",
    });
  }

  // Cor
  insights.push({
    icon: <Palette size={22} className="text-[#001A8C]" />,
    techLabel: `Cor ${v.cor}`,
    humanLabel: v.cor === "Preto" ? "Elegancia classica - sempre valorizado na revenda"
      : v.cor === "Branco" ? "Cor mais procurada do mercado - otima valorizacao"
      : v.cor === "Prata" ? "Cor neutra e pratica - esconde pequenas sujeiras"
      : "Visual marcante e diferenciado",
  });

  return insights;
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
  const insights = useMemo(() => generateInsights(v), [v]);
  const topInsights = insights.slice(0, 3);

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
          <h1 className="font-barlow-condensed font-black text-2xl text-atria-text-dark leading-tight">
            {v.marca} {v.modelo}
          </h1>
          {v.versao && (
            <p className="font-inter text-sm text-atria-text-gray mt-0.5">{v.versao}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className="bg-atria-gray-light font-inter text-xs font-semibold text-atria-text-dark px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Gauge size={12} className="text-atria-navy" /> {fmtKm(v.km)}
          </span>
          <span className="bg-atria-gray-light font-inter text-xs font-semibold text-atria-text-dark px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Calendar size={12} className="text-atria-navy" /> {v.ano}
          </span>
          {v.tipo && (
            <span className="bg-atria-gray-light font-inter text-xs font-semibold text-atria-text-dark px-3 py-1.5 rounded-full">
              {v.tipo}
            </span>
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

        {/* AI Strong Points */}
        {topInsights.length > 0 && (
          <div className="space-y-2">
            {topInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#E8EFFF] rounded-lg p-3">
                <span className="mt-0.5 flex-shrink-0">{insight.icon}</span>
                <p className="font-inter text-sm text-atria-text-dark leading-snug">
                  {insight.humanLabel}
                </p>
              </div>
            ))}
          </div>
        )}

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
          QUERO ESSE {v.marca.toUpperCase()} {v.modelo.toUpperCase()}!
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

        {/* Trust seals */}
        <div className="border-t border-atria-gray-medium pt-4 space-y-2.5">
          {[
            { icon: <ShieldCheck size={16} className="text-green-500" />, text: "Veiculo inspecionado com laudo" },
            { icon: <Star size={16} className="text-atria-yellow" />, text: "Garantia de 90 dias" },
            { icon: <CheckCircle size={16} className="text-atria-navy" />, text: "Documentacao em dia" },
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

// ---- AI Technical Translation Cards -----------------------------------------
function AITranslationCards({ v }: { v: Vehicle }) {
  const insights = useMemo(() => generateInsights(v), [v]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-4 uppercase tracking-wide">
        Traducao Tecnica IA
      </h2>
      <p className="font-inter text-sm text-atria-text-gray mb-4">
        Entenda o que cada especificacao significa no seu dia a dia
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-[#E8EFFF] border border-[#C5D5FF] rounded-xl p-4 flex gap-3 items-start"
          >
            <span className="mt-0.5 flex-shrink-0">{insight.icon}</span>
            <div>
              <p className="font-inter text-xs font-semibold text-[#001A8C] uppercase tracking-wider">
                {insight.techLabel}
              </p>
              <p className="font-inter text-sm text-atria-text-dark mt-1 leading-relaxed">
                {insight.humanLabel}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ---- Financing Banner + Credere Plugin --------------------------------------
function FinancingSection({ v }: { v: Vehicle }) {
  const modelo = v.titulo ?? `${v.marca} ${v.modelo}`;
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Banner */}
      <div className="bg-gradient-to-r from-atria-navy to-atria-navy-mid rounded-xl p-6 mb-6">
        <h2 className="font-barlow-condensed font-black text-2xl text-white mb-2">
          Simule o financiamento
        </h2>
        <p className="font-inter text-sm text-white/80">
          Gostou desta {modelo}? Simule as parcelas e receba pre-aprovacao em 30 segundos
        </p>
      </div>

      {/* Credere widget container - DO NOT CHANGE */}
      <div
        id="credere-pnp"
        data-marca={v.marca}
        data-modelo={v.modelo}
        data-ano={String(v.ano)}
        data-preco={String(v.preco)}
      />
    </motion.section>
  );
}

// ---- Lead Capture Form ------------------------------------------------------
function LeadCaptureForm({ v }: { v: Vehicle }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [sent, setSent] = useState(false);
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.telefone) return;
    await saveLead({
      source: "vehicle-comparativo-ia",
      whatsapp: form.telefone,
      nome: form.nome,
      query: titulo,
      dados: { email: form.email, slug: v.slug, preco: v.preco },
    });
    setSent(true);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-atria-navy to-atria-navy-dark rounded-2xl p-8 text-center"
      >
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h3 className="font-barlow-condensed font-black text-2xl text-white mb-2">
          Comparativo enviado!
        </h3>
        <p className="font-inter text-sm text-white/70">
          Voce recebera o comparativo inteligente do {titulo} no seu e-mail em instantes.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-br from-atria-navy to-atria-navy-dark rounded-2xl p-8">
        <h2 className="font-barlow-condensed font-black text-2xl text-white mb-1">
          Receba um comparativo inteligente
        </h2>
        <p className="font-inter text-sm text-white/70 mb-6">
          Nossa IA compara este veiculo com seus concorrentes diretos
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 font-inter text-sm focus:outline-none focus:border-white/50 transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 font-inter text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="tel"
              placeholder="Seu telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 font-inter text-sm focus:outline-none focus:border-white/50 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-colors"
          >
            Receber Comparativo Gratis
          </button>
        </form>
      </div>
    </motion.section>
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

      {/* ============ HERO: 60/40 Layout ============ */}
      <div className="container mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN (60%) */}
          <div className="w-full lg:w-[60%] space-y-8 min-w-0">
            {/* Gallery */}
            <PhotoGallery fotos={vehicle.fotos} titulo={titulo} />

            {/* Title (mobile only) */}
            <div className="lg:hidden">
              <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider">{vehicle.marca}</p>
              <h1 className="font-barlow-condensed font-black text-3xl text-atria-text-dark leading-tight">
                {titulo}
              </h1>
              {vehicle.versao && (
                <p className="font-inter text-sm text-atria-text-gray mt-1">{vehicle.versao}</p>
              )}
            </div>

            {/* Description */}
            <section>
              <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                Sobre o veiculo
              </h2>
              <p className="font-inter text-base text-atria-text-dark leading-relaxed">{vehicle.descricao}</p>
            </section>

            {/* AI Translation Cards */}
            <AITranslationCards v={vehicle} />

            {/* Financing / Credere */}
            <FinancingSection v={vehicle} />

            {/* Opcionais */}
            {vehicle.opcionais && vehicle.opcionais.length > 0 && (
              <section>
                <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                  Opcionais e equipamentos
                </h2>
                <OpcionaisSection opcionais={vehicle.opcionais} />
              </section>
            )}

            {/* Lead Capture Form */}
            <LeadCaptureForm v={vehicle} />
          </div>

          {/* RIGHT COLUMN (40%) - Sticky */}
          <aside className="hidden lg:block w-[40%] shrink-0">
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
