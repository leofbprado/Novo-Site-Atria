import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronDown, Calendar,
  Gauge, Fuel, Settings, Palette, DoorOpen, ShieldCheck,
  Star, Phone, CheckCircle, Car, MapPin, Mountain,
  Cog, Users, TrendingDown, X, ZoomIn,
  MessageCircle, Camera,
} from "lucide-react";
import { getVehicleBySlug, getVehicles, getSiteConfig, saveLead, vehiclePath, type Vehicle, type SiteConfig } from "@/lib/firestore";
import { ROUTES } from "@/lib/constants";
import { track, trackLead, trackIntent } from "@/lib/track";
import { pushRecentSlug } from "@/lib/recentlyViewed";
import { getPrecoExibicao, precoEfetivo, parcelaParaPreco, SIM_PRAZO } from "@/lib/preco";
import { TagBadge } from "@/components/TagBadge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PriceCTABox } from "@/components/vehicle/PriceCTABox";
import { useOrientation } from "@/hooks/useOrientation";

// ---- Helpers ----------------------------------------------------------------
const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (n: number) => `${n.toLocaleString("pt-BR")} km`;

function formatPhone(s: string): string {
  const d = s.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}


// ---- SEO --------------------------------------------------------------------
import { useSEO } from "@/hooks/useSEO";
import { SITE_URL } from "@/lib/constants";
import { trackVehicleEvent } from "@/lib/vehicleAnalytics";

function useVehicleSEO(v: Vehicle | null) {
  const opcionaisStr = v?.opcionais?.slice(0, 3).join(", ") || "";
  useSEO({
    title: v
      ? `Comprar ${v.marca} ${v.modelo} ${v.ano} Usado em Campinas | ${fmt(precoEfetivo(v))} | Átria Veículos`
      : "Veículo | Átria Veículos",
    description: v
      ? `${v.marca} ${v.modelo} ${v.versao ?? ""} ${v.ano} com ${fmtKm(v.km)}, ${v.cambio}, ${v.combustivel}.${opcionaisStr ? ` ${opcionaisStr}.` : ""} ${fmt(precoEfetivo(v))} à vista. Átria Veículos Campinas.`
      : "Veículo seminovo na Átria Veículos em Campinas SP.",
    path: v ? vehiclePath(v) : ROUTES.estoque,
    ogImage: v?.fotos?.[0],
    ogType: "product",
  });

  useEffect(() => {
    if (!v) return;
    const old = document.getElementById("schema-vehicle");
    if (old) old.remove();
    const canonicalUrl = `${SITE_URL}${vehiclePath(v)}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": `${v.marca} ${v.modelo} ${v.ano}`,
      "brand": { "@type": "Brand", "name": v.marca },
      "model": v.modelo,
      "vehicleModelDate": String(v.ano),
      "vehicleConfiguration": v.versao || undefined,
      "color": v.cor,
      "vehicleTransmission": v.cambio,
      "fuelType": v.combustivel,
      "numberOfDoors": v.portas,
      "itemCondition": "https://schema.org/UsedCondition",
      "url": canonicalUrl,
      "mileageFromOdometer": { "@type": "QuantitativeValue", "value": v.km, "unitCode": "KMT" },
      "image": v.fotos,
      "description": v.descricao,
      "offers": {
        "@type": "Offer",
        "price": precoEfetivo(v),
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "AutoDealer",
          "name": "Átria Veículos",
          "url": SITE_URL,
          "telephone": "+55 19 99652-5211",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Campinas",
            "addressRegion": "SP",
            "addressCountry": "BR",
          },
        },
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
    badges.push({ icon: <Mountain size={14} />, label: "Tração integral" });
  }
  if (v.cambio === "Autom\u00e1tica" || v.cambio === "CVT") {
    badges.push({ icon: <Cog size={14} />, label: "Câmbio automático" });
  }
  if (descLower.includes("7 lugares") || opcionaisLower.includes("7 lugares")) {
    badges.push({ icon: <Users size={14} />, label: "7 lugares" });
  }
  if (v.ano >= 2022) {
    badges.push({ icon: <Calendar size={14} />, label: "Seminovo recente" });
  }
  if (v.tipo === "SUV" || v.tipo === "Pickup") {
    badges.push({ icon: <Car size={14} />, label: "Versátil" });
  }

  return badges.slice(0, 3);
}

// ---- Photo Gallery ----------------------------------------------------------
const MAX_DOTS = 9;

function GalleryDots({
  total, current, onSelect, variant = "default",
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
  variant?: "default" | "overlay";
}) {
  if (total <= 1) return null;
  const visible = Math.min(total, MAX_DOTS);
  const indices = Array.from({ length: visible }, (_, i) => i);
  const overflow = total > MAX_DOTS;

  return (
    <div
      className={`flex items-center justify-center gap-1.5 ${
        variant === "overlay"
          ? "px-3 py-2 rounded-full bg-black/40 backdrop-blur-sm"
          : ""
      }`}
      role="tablist"
      aria-label="Indicador de fotos"
    >
      {indices.map((i) => {
        const isActive = i === current || (overflow && i === MAX_DOTS - 1 && current >= MAX_DOTS - 1);
        const isLastWithOverflow = overflow && i === MAX_DOTS - 1;
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onSelect(isLastWithOverflow ? total - 1 : i); }}
            // Hit-area invisível de 24px×24px (padding) com bolinha visual centrada
            // — atende mínimo de touch target sem poluir o design.
            className="p-2 -m-2 flex items-center justify-center"
            aria-label={`Foto ${isLastWithOverflow ? total : i + 1} de ${total}`}
            aria-selected={isActive}
            role="tab"
          >
            <span
              className={`block transition-all rounded-full ${
                isActive
                  ? variant === "overlay"
                    ? "w-2 h-2 bg-white"
                    : "w-2 h-2 bg-atria-navy"
                  : variant === "overlay"
                    ? "w-1.5 h-1.5 bg-white/50"
                    : "w-1.5 h-1.5 bg-atria-gray-medium"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function PhotoGallery({ fotos, titulo, slug }: { fotos: string[]; titulo: string; slug: string }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const orientation = useOrientation();
  const isLandscapeLightbox = lightboxOpen && orientation === "landscape";

  const navigate = (delta: number) => {
    // Track deslizante é linear — clampa em vez de loopar pra animação não pular
    const next = Math.max(0, Math.min(fotos.length - 1, current + delta));
    if (next !== current) {
      setDirection(delta);
      setCurrent(next);
    }
  };

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const handleLightboxOpen = () => {
    setLightboxOpen(true);
    trackVehicleEvent(slug, "gallery_lightbox_open").catch(() => {});
  };

  // Hint "Deslize ou toque" some após 3s pra não poluir depois que usuário entendeu
  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft" && fotos.length > 1) navigate(-1);
      else if (e.key === "ArrowRight" && fotos.length > 1) navigate(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, fotos.length]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-atria-gray-light group">
        {/* Track deslizante estilo Instagram — foto segue o dedo no swipe */}
        <motion.div
          className="absolute inset-0 flex"
          style={{ width: `${fotos.length * 100}%` }}
          animate={{ x: `-${(current * 100) / fotos.length}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          drag={fotos.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const threshold = 50;
            if (info.offset.x < -threshold || info.velocity.x < -300) {
              if (current < fotos.length - 1) {
                navigate(1);
                trackVehicleEvent(slug, "gallery_swipe").catch(() => {});
              }
            } else if (info.offset.x > threshold || info.velocity.x > 300) {
              if (current > 0) {
                navigate(-1);
                trackVehicleEvent(slug, "gallery_swipe").catch(() => {});
              }
            }
          }}
        >
          {fotos.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full"
              style={{ width: `${100 / fotos.length}%` }}
            >
              <img
                src={src}
                alt={`${titulo} - foto ${i + 1}`}
                onClick={handleLightboxOpen}
                className="w-full h-full object-cover cursor-zoom-in"
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </motion.div>

        <AnimatePresence>
          {hintVisible && fotos.length > 1 && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-inter font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none"
            >
              <ZoomIn size={14} /> Deslize ou toque para ampliar
            </motion.span>
          )}
        </AnimatePresence>

        {fotos.length > 1 && (
          <>
            {/* Setas só desktop (mobile usa swipe puro, igual Instagram) */}
            <button
              onClick={() => navigate(-1)}
              disabled={current === 0}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => navigate(1)}
              disabled={current === fotos.length - 1}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Próxima foto"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-sm font-inter font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Camera size={14} /> {current + 1} / {fotos.length}
        </span>
      </div>

      {/* Dots indicadores — Instagram-style. Mostrados também no mobile pra incentivar swipe. */}
      {fotos.length > 1 && (
        <div className="flex justify-center pt-1">
          <GalleryDots total={fotos.length} current={current} onSelect={goTo} />
        </div>
      )}

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((src, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
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

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={`${titulo} - foto ampliada`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className={`absolute rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ${
                isLandscapeLightbox ? "top-2 right-2 w-9 h-9" : "top-4 right-4 w-11 h-11"
              }`}
              aria-label="Fechar"
            >
              <X size={isLandscapeLightbox ? 20 : 24} />
            </button>

            <motion.img
              key={current}
              src={fotos[current]}
              alt={`${titulo} - foto ${current + 1}`}
              onClick={(e) => e.stopPropagation()}
              className={`object-contain select-none ${
                isLandscapeLightbox
                  ? "w-screen h-screen max-w-none max-h-none"
                  : "max-w-[95vw] max-h-[90vh]"
              }`}
              draggable={false}
              drag={fotos.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80) {
                  navigate(info.offset.x < 0 ? 1 : -1);
                  trackVehicleEvent(slug, "gallery_swipe_lightbox").catch(() => {});
                }
              }}
            />

            {fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ${
                    isLandscapeLightbox ? "left-2 w-10 h-10" : "left-4 w-12 h-12"
                  }`}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={isLandscapeLightbox ? 22 : 28} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ${
                    isLandscapeLightbox ? "right-2 w-10 h-10" : "right-4 w-12 h-12"
                  }`}
                  aria-label="Próxima foto"
                >
                  <ChevronRight size={isLandscapeLightbox ? 22 : 28} />
                </button>
                {/* Dots e contador escondidos em landscape — foco total na imagem */}
                {!isLandscapeLightbox && (
                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GalleryDots
                      total={fotos.length}
                      current={current}
                      onSelect={goTo}
                      variant="overlay"
                    />
                    <span className="bg-white/10 text-white text-sm font-inter font-semibold px-3 py-1.5 rounded-full">
                      {current + 1} / {fotos.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Opcionais Accordion ----------------------------------------------------
const CATEGORIAS_OPCIONAIS = [
  { label: "Conforto", keywords: ["ar-condicionado", "direcao", "vidros", "travas", "banco", "teto solar", "volante", "retrovisor", "piloto", "ventilado", "aquecido"] },
  { label: "Seguranca", keywords: ["airbag", "abs", "sensor de estacion", "camera", "freio", "estabilidade", "isofix", "lane", "safety", "cmbs", "lka", "pcs", "frenagem"] },
  { label: "Multimidia", keywords: ["tela", "bluetooth", "usb", "apple carplay", "android auto", "som", "mylink", "uconnect", "mmi", "mbux", "sync", "discover", "carplay"] },
  { label: "Exterior", keywords: ["farol", "rodas", "spoiler", "pintura", "escape", "tração", "bloqueio"] },
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  const trackProps = {
    vehicle_id: v.slug,
    vehicle_marca: v.marca,
    vehicle_modelo: v.modelo,
    vehicle_ano: v.ano,
    vehicle_preco: precoEfetivo(v),
    value: precoEfetivo(v),
  };

  const handleInteresseClick = () => {
    trackVehicleEvent(v.slug, "clique_interesse_header").catch(() => {});
    track("cta_click", { source: "ficha-interesse-panel", cta: "interesse", ...trackProps });
    trackIntent("lead_tenho_interesse_aberto", {
      origem: "ficha",
      marca: v.marca, modelo: v.modelo, preco: precoEfetivo(v),
    });
    setDrawerOpen(true);
  };

  const waMsg = `Olá! Me interessei pelo ${titulo} ${v.ano} (${fmt(precoEfetivo(v))}). Poderia me atender?`;
  const handleWhatsClick = () => {
    trackVehicleEvent(v.slug, "clique_whatsapp_header").catch(() => {});
    trackVehicleEvent(v.slug, "clique_whatsapp").catch(() => {});
    trackLead({
      clarityEvent: "lead_whatsapp_ficha",
      gtmEvent: "whatsapp_click",
      origem: "ficha",
      source: "ficha-whatsapp-panel",
      marca: v.marca, modelo: v.modelo, ano: v.ano, preco: precoEfetivo(v),
    });
  };

  const handleSimularCredere = () => {
    trackVehicleEvent(v.slug, "clique_simular_credere_header").catch(() => {});
    trackLead({
      clarityEvent: "lead_simular_credere_ficha",
      gtmEvent: "cta_click",
      origem: "ficha",
      source: "ficha-credere-panel",
      marca: v.marca, modelo: v.modelo, ano: v.ano, preco: precoEfetivo(v),
    });
    document.getElementById("financiamento")?.scrollIntoView({ behavior: "smooth" });
  };

  const preco = precoEfetivo(v);
  const parcela = parcelaParaPreco(preco, preco * 0.4);

  return (
    <>
      <div className="space-y-4">
        {/* Header marca/modelo (só desktop sidebar) */}
        <div className="px-1">
          <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider">{v.marca}</p>
          <h2 className="font-barlow-condensed font-black text-2xl text-atria-text-dark leading-tight">
            {v.marca} {v.modelo}
          </h2>
          {v.versao && (
            <p className="font-inter text-sm text-atria-text-gray mt-0.5">{v.versao}</p>
          )}
        </div>

        <PriceCTABox
          priceCash={preco}
          installmentValue={parcela}
          installments={SIM_PRAZO}
          downPaymentPercent={40}
          whatsappUrl={waLink(waMsg)}
          onInterestClick={handleInteresseClick}
          onWhatsappClick={handleWhatsClick}
          enableSticky={false}
        />

        <button
          onClick={handleSimularCredere}
          className="w-full text-center font-inter text-sm text-atria-text-gray hover:text-atria-navy underline underline-offset-4 decoration-atria-gray-medium hover:decoration-atria-navy transition-colors"
        >
          Simular financiamento →
        </button>

        {/* Trust seals */}
        <div className="bg-white border border-atria-gray-medium rounded-2xl p-5 space-y-2.5">
          {[
            { icon: <ShieldCheck size={16} className="text-green-500" />, text: "Veículo inspecionado com laudo" },
            { icon: <Star size={16} className="text-atria-yellow-bright" />, text: "Garantia de 90 dias" },
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

      <AnimatePresence>
        {drawerOpen && (
          <InterestDrawer vehicle={v} onClose={() => setDrawerOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ---- Action Block (CTAs contextualizados com o veículo) ---------------------
function ActionBlock({ v }: { v: Vehicle }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  const trackProps = {
    vehicle_id: v.slug,
    vehicle_marca: v.marca,
    vehicle_modelo: v.modelo,
    vehicle_ano: v.ano,
    vehicle_preco: precoEfetivo(v),
    value: precoEfetivo(v),
  };

  const handleInteresseClick = () => {
    trackVehicleEvent(v.slug, "clique_interesse_header").catch(() => {});
    track("cta_click", { source: "ficha-interesse-header", cta: "interesse", ...trackProps });
    trackIntent("lead_tenho_interesse_aberto", {
      origem: "ficha",
      marca: v.marca, modelo: v.modelo, preco: precoEfetivo(v),
    });
    setDrawerOpen(true);
  };

  const handleSimularCredere = () => {
    trackVehicleEvent(v.slug, "clique_simular_credere_header").catch(() => {});
    trackLead({
      clarityEvent: "lead_simular_credere_ficha",
      gtmEvent: "cta_click",
      origem: "ficha",
      source: "ficha-credere-header",
      marca: v.marca, modelo: v.modelo, ano: v.ano, preco: precoEfetivo(v),
    });
    document.getElementById("financiamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const waMsg = `Olá! Me interessei pelo ${titulo} ${v.ano} (${fmt(precoEfetivo(v))}). Poderia me atender?`;
  const handleWhatsClick = () => {
    trackVehicleEvent(v.slug, "clique_whatsapp_header").catch(() => {});
    trackVehicleEvent(v.slug, "clique_whatsapp").catch(() => {});
    trackLead({
      clarityEvent: "lead_whatsapp_ficha",
      gtmEvent: "whatsapp_click",
      origem: "ficha",
      source: "ficha-whatsapp-header",
      marca: v.marca, modelo: v.modelo, ano: v.ano, preco: precoEfetivo(v),
    });
  };

  const preco = precoEfetivo(v);
  const parcela = parcelaParaPreco(preco, preco * 0.4);

  return (
    <>
      <div className="space-y-3">
        <PriceCTABox
          priceCash={preco}
          installmentValue={parcela}
          installments={SIM_PRAZO}
          downPaymentPercent={40}
          whatsappUrl={waLink(waMsg)}
          onInterestClick={handleInteresseClick}
          onWhatsappClick={handleWhatsClick}
        />
        <button
          onClick={handleSimularCredere}
          className="w-full text-center font-inter text-sm text-atria-text-gray hover:text-atria-navy underline underline-offset-4 decoration-atria-gray-medium hover:decoration-atria-navy transition-colors pt-1"
        >
          Simular financiamento →
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <InterestDrawer
            vehicle={v}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function InterestDrawer({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const titulo = vehicle.titulo ?? `${vehicle.marca} ${vehicle.modelo}`;
  const waMsg = `Olá! Me chamo ${nome}, tenho interesse no ${titulo} ${vehicle.ano} (${fmt(precoEfetivo(vehicle))}). Qual a disponibilidade?`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !containerRef.current) return;
      const focusables = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), a[href]'
        )
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !whatsapp) return;
    setSending(true);
    try {
      await saveLead({
        source: "vehicle-interesse",
        nome,
        whatsapp,
        query: titulo,
        dados: {
          slug: vehicle.slug,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          ano: vehicle.ano,
          preco: precoEfetivo(vehicle),
          placa: (vehicle as any).placa_final || (vehicle as any).placa || undefined,
          km: vehicle.km,
        },
      });
      trackVehicleEvent(vehicle.slug, "vehicle_interesse_lead").catch(() => {});
      trackVehicleEvent(vehicle.slug, "lead").catch(() => {});
      trackLead({
        clarityEvent: "lead_tenho_interesse_ficha",
        origem: "ficha",
        source: "vehicle-interesse",
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        ano: vehicle.ano,
        preco: precoEfetivo(vehicle),
      });
    } catch { /* não bloqueia */ }
    setSending(false);
    setDone(true);
  };

  const handleOpenWhatsApp = () => {
    trackVehicleEvent(vehicle.slug, "clique_whatsapp").catch(() => {});
    trackLead({
      clarityEvent: "lead_whatsapp_ficha",
      gtmEvent: "whatsapp_click",
      origem: "ficha",
      source: "vehicle-interesse-success",
      marca: vehicle.marca, modelo: vehicle.modelo, ano: vehicle.ano, preco: precoEfetivo(vehicle),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interest-drawer-title"
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-atria-text-gray hover:text-atria-text-dark transition-colors z-10"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle size={52} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-2">
              Tudo certo, {nome.split(" ")[0]}!
            </h3>
            <p className="font-inter text-sm text-atria-text-gray mb-5">
              Recebemos seu interesse. Toque abaixo para abrir o WhatsApp e falar agora com a gente.
            </p>
            <a
              href={waLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenWhatsApp}
              className="w-full bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 text-white font-inter font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={18} /> Abrir WhatsApp agora
            </a>
          </div>
        ) : (
          <>
            <div className="bg-atria-navy px-6 py-5">
              <h3 id="interest-drawer-title" className="font-barlow-condensed font-black text-xl text-white">
                Tenho interesse no {vehicle.modelo}
              </h3>
              <p className="font-inter text-white/70 text-sm mt-1">
                {vehicle.marca} {vehicle.modelo} {vehicle.ano} — {fmt(precoEfetivo(vehicle))}
              </p>
            </div>
            <form className="px-6 py-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="interest-nome" className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Seu nome</label>
                <input
                  id="interest-nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <div>
                <label htmlFor="interest-whatsapp" className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">WhatsApp</label>
                <input
                  id="interest-whatsapp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(19) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 disabled:opacity-60 text-white font-inter font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={18} />
                {sending ? "Enviando..." : "Enviar e abrir WhatsApp"}
              </button>
              <p className="text-xs text-atria-text-gray text-center">
                Ao enviar, você vai direto pro WhatsApp da Átria. Seu contato fica só com o time de vendas — sem SPAM.
              </p>
            </form>
          </>
        )}
      </motion.div>
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
    if (v.cambio === "Autom\u00e1tica") return "Conforto no trânsito urbano";
    if (v.cambio === "CVT") return "Transições suaves, economia otimizada";
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
    { icon: <Settings size={16} />, label: "Câmbio", value: v.cambio, sub: cambioSubtext() },
    { icon: <Fuel size={16} />, label: "Combustivel", value: v.combustivel, sub: combustivelSubtext() },
    { icon: <Palette size={16} />, label: "Cor", value: v.cor, sub: null },
    { icon: <DoorOpen size={16} />, label: "Portas", value: v.portas ? `${v.portas} portas` : "-", sub: null },
  ];

  return (
    <section>
      <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-4 uppercase tracking-wide">
        Ficha Tecnica
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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

// ---- Dados Técnicos (accordion, only if data exists) -----------------------
const TECH_SPEC_LABELS: { key: string; label: string; unit: string }[] = [
  { key: "potenciaCv", label: "Potência", unit: " cv" },
  { key: "torqueKgfM", label: "Torque", unit: " kgf·m" },
  { key: "comprimentoMm", label: "Comprimento", unit: " mm" },
  { key: "larguraMm", label: "Largura", unit: " mm" },
  { key: "alturaMm", label: "Altura", unit: " mm" },
  { key: "entreEixosMm", label: "Entre-eixos", unit: " mm" },
  { key: "pesoKg", label: "Peso", unit: " kg" },
  { key: "portaMalasLitros", label: "Porta-malas", unit: " litros" },
  { key: "tanqueLitros", label: "Tanque", unit: " litros" },
  { key: "consumoCidadeKmL", label: "Consumo (cidade)", unit: " km/l" },
  { key: "consumoEstradaKmL", label: "Consumo (estrada)", unit: " km/l" },
];

function DadosTecnicos({ v }: { v: Vehicle }) {
  const specs = v.technical_specs;
  if (!specs) return null;

  const rows = TECH_SPEC_LABELS
    .filter(({ key }) => (specs as any)[key] != null)
    .map(({ key, label, unit }) => ({ label, value: `${(specs as any)[key].toLocaleString("pt-BR")}${unit}` }));

  if (rows.length === 0) return null;

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="dados-tecnicos" className="border rounded-lg px-4">
        <AccordionTrigger className="font-barlow-condensed font-bold text-xl text-atria-text-dark uppercase tracking-wide hover:no-underline">
          Dados Técnicos
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="font-inter text-sm text-atria-text-gray">{r.label}</span>
                <span className="font-inter text-sm font-semibold text-atria-text-dark">{r.value}</span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
        data-preco={String(precoEfetivo(v))}
      />
    </section>
  );
}

// ---- Similar Card -----------------------------------------------------------
function SimilarCard({ v }: { v: Vehicle }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  return (
    <a
      href={vehiclePath(v)}
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
        <div className="flex items-baseline gap-2 flex-wrap mt-2">
          {getPrecoExibicao(v).precoCheio && (
            <span className="font-inter text-xs text-atria-text-gray line-through">{fmt(getPrecoExibicao(v).precoCheio!)}</span>
          )}
          <p className="font-barlow-condensed font-black text-xl text-atria-navy">{fmt(getPrecoExibicao(v).precoFinal)}</p>
          {getPrecoExibicao(v).emPromocao && (
            <TagBadge tag="oferta" size="xs" />
          )}
        </div>
      </div>
    </a>
  );
}


// ---- Store Locations Footer -------------------------------------------------
function StoreLocations() {
  const stores = [
    { name: "Loja Abolicao", address: "Rua Abolicao, 1500 - VL Joaquim Inacio, Campinas - SP" },
    { name: "Loja Campos Eliseos", address: "R. Domicio Pacheco e Silva, 1328 - Jd Campos Eliseos, Campinas - SP" },
    { name: "Loja Guanabara", address: "Av. Brasil, 1277 - Jd Guanabara, Campinas - SP" },
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
        href={waLink("Olá! Gostaria de agendar uma visita presencial na loja. Qual a disponibilidade?")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackLead({
          clarityEvent: "lead_agendar_visita",
          gtmEvent: "whatsapp_click",
          origem: "ficha",
          source: "ficha-agendar-visita",
        })}
        className="mt-6 inline-flex items-center gap-2 bg-gradient-to-b from-atria-navy-light to-atria-navy hover:brightness-110 text-white font-inter font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
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
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ highlights_padrao: [], disclaimer_padrao: "" });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getVehicleBySlug(slug), getVehicles(), getSiteConfig()]).then(([v, all, cfg]) => {
      if (!v) setNotFound(true);
      else setVehicle(v);
      setAllVehicles(all);
      setSiteConfig(cfg);
      setLoading(false);
    });
  }, [slug]);

  useVehicleSEO(vehicle);

  // Track pageview + adiciona à lista "recently viewed" (CarMax-style)
  useEffect(() => {
    if (!vehicle) return;
    trackVehicleEvent(vehicle.slug, "pageview").catch(() => {});
    pushRecentSlug(vehicle.slug);
  }, [vehicle?.slug]);

  // Load Credere widget script after vehicle data is in the DOM
  useEffect(() => {
    if (!vehicle) return;
    const CREDERE_SRC = "https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js";
    // Mata qualquer iframe órfão antes de injetar — sem isso, o widget antigo
    // dispara alert("erro ao carregar configurações") quando o veículo muda
    // ou a ficha desmonta.
    const container = document.getElementById("credere-pnp");
    if (container) container.replaceChildren();
    document.querySelector(`script[src="${CREDERE_SRC}"]`)?.remove();
    const timer = setTimeout(() => {
      const s = document.createElement("script");
      s.src = CREDERE_SRC;
      s.async = true;
      document.body.appendChild(s);
    }, 500);
    return () => {
      clearTimeout(timer);
      document.querySelector(`script[src="${CREDERE_SRC}"]`)?.remove();
      const c = document.getElementById("credere-pnp");
      if (c) c.replaceChildren();
    };
  }, [vehicle]);

  /**
   * "Você também pode gostar" — ranking por proximidade.
   *
   * Pesos (quanto maior, mais influente no ranking):
   *   1. Faixa de valor: até 100 pontos (cai linearmente conforme distância de preço)
   *      — sweet spot: ±15% do preço do veículo atual
   *   2. Mesmo tipo (SUV/Sedan/Hatch/Pickup): +40 pontos
   *   3. Mesma marca: +25 pontos
   *   4. Mesmo combustível: +5 pontos (desempate)
   *
   * Sempre exclui o veículo atual e qualquer um sem preço.
   */
  const similar = useMemo(() => {
    if (!vehicle) return [];
    const myPrice = precoEfetivo(vehicle) || 0;
    if (myPrice === 0) return [];

    const candidates = allVehicles
      .filter((v) => v.id !== vehicle.id && (precoEfetivo(v) || 0) > 0)
      .map((v) => {
        let score = 0;

        // 1. Faixa de valor — peso máximo
        const priceDiff = Math.abs(precoEfetivo(v) - myPrice);
        const priceRatio = priceDiff / myPrice; // 0 = mesmo preço, 1 = 100% mais caro/barato
        if (priceRatio <= 0.15) score += 100;          // ±15% = match perfeito
        else if (priceRatio <= 0.30) score += 70;      // ±30%
        else if (priceRatio <= 0.50) score += 40;      // ±50%
        else if (priceRatio <= 1.00) score += 15;      // até 100% off
        // > 100% = sem score de preço

        // 2. Mesmo tipo (SUV vs Sedan vs Hatch vs Pickup)
        if (v.tipo && vehicle.tipo && v.tipo === vehicle.tipo) {
          score += 40;
        }

        // 3. Mesma marca
        if (v.marca === vehicle.marca) {
          score += 25;
        }

        // 4. Mesmo combustível (desempate)
        if (v.combustivel === vehicle.combustivel) {
          score += 5;
        }

        return { vehicle: v, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.vehicle);

    return candidates;
  }, [vehicle, allVehicles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Carregando veículo">
        <div className="w-10 h-10 rounded-full border-4 border-atria-gray-medium border-t-atria-navy animate-spin" />
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Car size={56} className="text-atria-gray-medium" />
        <h1 className="font-barlow-condensed font-black text-3xl text-atria-text-dark">Veículo não encontrado</h1>
        <p className="font-inter text-atria-text-gray">Este veículo pode ter sido vendido ou o link está incorreto.</p>
        <a href={ROUTES.estoque} className="btn-navy rounded-xl mt-2">Ver estoque completo</a>
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
            <li><a href={ROUTES.estoque} className="hover:text-atria-navy transition-colors">Estoque</a></li>
            <li className="opacity-40">/</li>
            <li className="text-atria-text-dark font-semibold truncate max-w-[200px]">{titulo}</li>
          </ol>
        </nav>
      </div>

      {/* ============ HERO: 70/30 Layout ============ */}
      <div className="container mx-auto px-4 py-6 pb-32 lg:pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN (70%) */}
          <div className="w-full lg:w-[70%] space-y-8 min-w-0">
            {/* Gallery */}
            <PhotoGallery fotos={vehicle.fotos} titulo={titulo} slug={vehicle.slug} />

            {/* Action Block — CTAs contextualizados (mobile-first).
                A própria PriceCTABox observa a saída da viewport e
                renderiza a sticky bar embaixo. */}
            <div className="lg:hidden">
              <ActionBlock v={vehicle} />
            </div>

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

            {/* Description + condições globais como continuação */}
            <section>
              <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                Sobre o veículo
              </h2>
              <p className="font-inter text-base text-atria-text-dark leading-relaxed">{vehicle.descricao}</p>
              {siteConfig.highlights_padrao.length > 0 && (
                <ul className="mt-3 list-disc list-inside font-inter text-base font-bold text-atria-text-dark leading-relaxed space-y-1">
                  {siteConfig.highlights_padrao.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Ficha Tecnica */}
            <FichaTecnica v={vehicle} />

            {/* Dados Técnicos */}
            <DadosTecnicos v={vehicle} />

            {/* Opcionais */}
            {vehicle.opcionais && vehicle.opcionais.length > 0 && (
              <section>
                <h2 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase tracking-wide">
                  Opcionais e equipamentos
                </h2>
                <OpcionaisSection opcionais={vehicle.opcionais} />
              </section>
            )}

            {/* Disclaimer — texto global do admin (Configurações →
                disclaimer_padrao). bloco_final per-vehicle entra como
                fallback quando o disclaimer global não estiver definido. */}
            {(siteConfig.disclaimer_padrao || vehicle.bloco_final) && (
              <section className="bg-atria-gray-light border border-atria-gray-medium rounded-xl p-5">
                <p className="font-inter text-xs text-atria-text-gray leading-relaxed">
                  {siteConfig.disclaimer_padrao || vehicle.bloco_final}
                </p>
              </section>
            )}

            {/* Financing / Credere */}
            <FinancingSection key={vehicle.slug} v={vehicle} />
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
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((v) => <SimilarCard key={v.id} v={v} />)}
            </div>
          </motion.section>
        )}

        {/* Store Locations */}
        <div className="mt-12">
          <StoreLocations />
        </div>
      </div>
    </>
  );
}
