import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Carousel, type CarouselCard } from "@/components/ui/ThreeDCarousel";
import { ChevronDown, Star, CheckCircle, Car, Shield, Award, Phone, MapPin, X, Clock } from "lucide-react";
import { getFeaturedVehicles, getVehicles, saveLead, vehiclePath, type Vehicle } from "@/lib/firestore";
import { ROUTES } from "@/lib/constants";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useSEO } from "@/hooks/useSEO";
import { trackLead } from "@/lib/track";
import { brandLogoFor, brandDisplayName } from "@/lib/brandLogos";
import { HeroSection } from "@/components/home/HeroSection";

const WA_NUMBER = "5519996525211";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const waLink = (msg: string) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;

// ─── Shared: Lead Modal ───────────────────────────────────────────────────────
interface LeadModalProps {
  title: string;
  subtitle: string;
  source: string;
  extraData?: Record<string, unknown>;
  prefillMsg?: string;
  onClose: () => void;
}

function LeadModal({ title, subtitle, source, extraData, prefillMsg, onClose }: LeadModalProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await saveLead({ nome, whatsapp, source, dados: extraData });
    setSending(false);
    setDone(true);
    setTimeout(() => {
      const msg = prefillMsg ?? `Olá! Me chamo ${nome} e tenho interesse em veículos da Átria.`;
      window.open(waLink(msg), "_blank");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-atria-text-gray hover:text-atria-text-dark transition-colors z-10"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="p-10 text-center">
            <CheckCircle size={52} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark">
              Perfeito! Abrindo WhatsApp...
            </h3>
          </div>
        ) : (
          <>
            <div className="bg-atria-navy px-6 py-5">
              <h3 className="font-barlow-condensed font-black text-xl text-white">{title}</h3>
              <p className="font-inter text-white/70 text-sm mt-1">{subtitle}</p>
            </div>
            <form className="px-6 py-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Seu nome</label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <div>
                <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(19) 99652-5211"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-yellow w-full rounded-lg disabled:opacity-60"
              >
                {sending ? "Enviando..." : "RECEBER NO WHATSAPP"}
              </button>
              <p className="text-xs text-atria-text-gray text-center">
                Não enviamos spam. Apenas informações relevantes para você.
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Simulador ────────────────────────────────────────────────────────────────
const PRAZO_FIXO = 48;
const COEF_PARCELA = 0.035;
const FAIXA_DELTA = 7500;

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function calcularFaixa(entrada: number, parcela: number) {
  const valorBase = Math.round((entrada + parcela / COEF_PARCELA) / 1000) * 1000;
  const precoMin = Math.max(0, valorBase - FAIXA_DELTA);
  const precoMax = valorBase + FAIXA_DELTA;
  return { valorBase, precoMin, precoMax };
}

const LOADING_MESSAGES = [
  "Calculando sua faixa de preço...",
  "Cruzando com nosso estoque...",
  "Encontrando os melhores carros pra você...",
];

function SimuladorResultModal({
  entrada, parcela, source, onClose,
}: { entrada: number; parcela: number; source: string; onClose: () => void }) {
  const [step, setStep] = useState<"loading" | "form" | "resultado">("loading");
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sending, setSending] = useState(false);

  const { precoMin, precoMax } = calcularFaixa(entrada, parcela);

  useEffect(() => {
    if (step !== "loading") return;
    const rotate = setInterval(() => setLoadingIdx((i) => (i + 1) % LOADING_MESSAGES.length), 700);
    const advance = setTimeout(() => setStep("form"), 2100);
    return () => { clearInterval(rotate); clearTimeout(advance); };
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await saveLead({
        nome,
        whatsapp,
        source,
        query: `Simulação: entrada ${fmtBRL(entrada)}, parcela ${fmtBRL(parcela)}/mês, faixa ${fmtBRL(precoMin)}–${fmtBRL(precoMax)}`,
        dados: { entrada, parcela, prazo: PRAZO_FIXO, precoMin, precoMax },
      });
      // Dispara só após o 200 do saveLead — lead confirmado, não tentativa
      trackLead({
        clarityEvent: "lead_clickbait_home",
        origem: "home",
        source,
        preco: Math.round((precoMin + precoMax) / 2),
      });
    } catch (err) {
      console.error("[Simulador] erro ao salvar lead:", err);
    }
    setSending(false);
    setStep("resultado");
  };

  const handleVerEstoque = () => {
    window.location.href = `${ROUTES.estoque}?precoMin=${precoMin}&precoMax=${precoMax}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-atria-text-gray hover:text-atria-text-dark transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === "loading" ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border-4 border-atria-navy/15 border-t-atria-navy animate-spin" />
            <p className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-1">
              Simulando valores
            </p>
            <p className="font-inter text-sm text-atria-text-gray min-h-[20px]">
              {LOADING_MESSAGES[loadingIdx]}
            </p>
          </div>
        ) : step === "form" ? (
          <>
            <div className="bg-atria-navy px-6 py-5">
              <h3 className="font-barlow-condensed font-black text-xl text-white">Pronto! Falta só um passo 🎯</h3>
              <p className="font-inter text-white/70 text-sm mt-1">
                Deixe seu nome e WhatsApp para ver os carros que combinam com seu plano.
              </p>
            </div>
            <form className="px-6 py-5 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Seu nome</label>
                <input
                  type="text"
                  placeholder="João Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <div>
                <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(19) 99652-5211"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-atria-yellow text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-3 rounded-lg hover:brightness-95 transition-all disabled:opacity-60"
              >
                {sending ? "Calculando..." : "Ver minha faixa de preço →"}
              </button>
              <p className="text-atria-text-gray text-[11px] text-center">
                Seus dados são tratados com sigilo. Não enviamos spam.
              </p>
            </form>
          </>
        ) : (
          <div className="p-7 text-center">
            <p className="font-inter text-atria-text-gray text-xs uppercase tracking-widest mb-3">Sua faixa de preço</p>
            <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark leading-tight mb-2">
              Com esse investimento você pode comprar carros entre
            </h3>
            <p className="font-barlow-condensed font-black text-3xl text-atria-navy mb-6">
              {fmtBRL(precoMin)} <span className="text-atria-text-gray text-xl font-bold">e</span> {fmtBRL(precoMax)}
            </p>
            <button
              onClick={handleVerEstoque}
              className="w-full bg-atria-yellow text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-lg hover:brightness-95 transition-all"
            >
              Ver o que tem nessa faixa de valor →
            </button>
            <p className="text-atria-text-gray text-[11px] mt-4 leading-relaxed">
              * Simulação indicativa. Sujeito à aprovação de crédito. Taxas e condições finais sob consulta.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Simulador() {
  const [parcela, setParcela] = useState(1500);
  const [entrada, setEntrada] = useState(10000);
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-atria-gray-light py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Simulador</p>
          <h2 className="section-title">
            Encontre o Carro
            <br />
            Ideal Pro Seu Plano
          </h2>
          <p className="font-inter text-atria-text-gray mt-3 max-w-lg mx-auto">
            Diga quanto deseja dar de entrada e o valor da parcela ideal. Em segundos mostramos os carros que combinam com você.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm space-y-7 max-w-2xl mx-auto">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-inter font-semibold text-sm text-atria-text-dark">Valor de entrada</label>
              <span className="font-barlow-condensed font-bold text-xl text-atria-navy">{fmtBRL(entrada)}</span>
            </div>
            <input type="range" min={0} max={50000} step={1000} value={entrada}
              onChange={(e) => setEntrada(Number(e.target.value))}
              className="w-full accent-atria-navy" />
            <div className="flex justify-between text-xs text-atria-text-gray mt-1">
              <span>{fmtBRL(0)}</span><span>{fmtBRL(50000)}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-inter font-semibold text-sm text-atria-text-dark">Parcela desejada</label>
              <span className="font-barlow-condensed font-bold text-xl text-atria-navy">{fmtBRL(parcela)}</span>
            </div>
            <input type="range" min={500} max={5000} step={100} value={parcela}
              onChange={(e) => setParcela(Number(e.target.value))}
              className="w-full accent-atria-navy" />
            <div className="flex justify-between text-xs text-atria-text-gray mt-1">
              <span>{fmtBRL(500)}</span><span>{fmtBRL(5000)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-atria-navy hover:bg-atria-navy/90 text-white font-inter font-bold text-base uppercase tracking-wider py-4 rounded-lg transition-all"
          >
            Simular agora →
          </button>

          <p className="text-atria-text-gray text-[11px] text-center">
            * Simulação indicativa. Sujeito à aprovação de crédito.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <SimuladorResultModal
            entrada={entrada}
            parcela={parcela}
            source="simulador-home"
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}


// ─── 3D Brand Carousel ───────────────────────────────────────────────────────
function BrandCarousel() {
  const [cards, setCards] = useState<CarouselCard[]>([]);

  // Seção abaixo da fold — adiar fetch pra depois do LCP libera rede pra hero image.
  // requestIdleCallback roda quando main thread tá ociosa; timeout 2s garante que
  // não fica esperando demais se o browser nunca fica idle.
  useEffect(() => {
    const run = () => {
      getVehicles().then((vehicles) => {
        const counts: Record<string, number> = {};
        vehicles.forEach((v) => { counts[v.marca] = (counts[v.marca] || 0) + 1; });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([brand, count]) => ({
            brand,
            count,
            label: brandDisplayName(brand),
            svg: <BrandLogo marca={brand} />,
          }));
        setCards(sorted);
      }).catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 800);
    return () => clearTimeout(t);
  }, []);

  const handleClick = useCallback((brand: string) => {
    window.location.href = `${ROUTES.estoque}?marca=${encodeURIComponent(brand)}`;
  }, []);

  if (cards.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-[#001A8C] to-[#000D47] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <p className="font-inter text-atria-yellow text-xs uppercase tracking-widest font-bold mb-2">Navegue</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-white uppercase">
            Escolha por Marca
          </h2>
          <p className="font-inter text-white/50 text-sm mt-2 max-w-md mx-auto">
            Gire o carrossel ou clique em uma marca para ver os veículos disponíveis
          </p>
        </div>

        <div className="h-[220px] sm:h-[350px] md:h-[500px] w-full">
          <Carousel
            handleClick={handleClick}
            cards={cards}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-atria-gray-medium animate-pulse">
      <div className="aspect-[4/3] bg-atria-gray-medium" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-atria-gray-medium rounded w-3/4" />
        <div className="h-4 bg-atria-gray-medium rounded w-1/2" />
        <div className="h-6 bg-atria-gray-medium rounded w-2/5" />
      </div>
    </div>
  );
}

// ─── Estoque em Destaque ──────────────────────────────────────────────────────
const TIPO_TABS = ["Todos", "SUV", "Sedan", "Hatch", "Pickup"] as const;
type TipoTab = typeof TIPO_TABS[number];

function EstoqueDestaque() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TipoTab>("Todos");

  // Mesma estratégia do BrandCarousel — seção abaixo da fold, adiar pra depois do LCP.
  useEffect(() => {
    const run = () => {
      getFeaturedVehicles()
        .then((v) => { setVehicles(v); setLoading(false); })
        .catch(() => setLoading(false));
    };
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = tab === "Todos" ? vehicles : vehicles.filter((v) => v.tipo?.toLowerCase() === tab.toLowerCase());
  const displayed = (filtered.length > 0 ? filtered : vehicles).slice(0, 6);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-label mb-2">Estoque</p>
            <h2 className="section-title">Veículos em Destaque</h2>
          </div>
          <a href={ROUTES.estoque} className="btn-outline-navy rounded text-sm whitespace-nowrap self-start">
            Ver todos →
          </a>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {TIPO_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 font-inter font-semibold text-sm rounded-full transition-all ${
                tab === t ? "bg-atria-navy text-white" : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
              }`}>{t}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : displayed.map((v) => (
                <VehicleCard key={v.id} vehicle={v} fmt={fmt} />
              ))}
        </div>

        {!loading && displayed.length === 0 && (
          <p className="text-center text-atria-text-gray font-inter py-12">
            Nenhum veículo nessa categoria.{" "}
            <a href={ROUTES.estoque} className="text-atria-navy underline">Ver todos</a>
          </p>
        )}
      </div>
    </section>
  );
}

function VehicleCard({ vehicle: v, fmt }: { vehicle: Vehicle; fmt: (n: number) => string }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;

  return (
    <motion.div
      className="group bg-white rounded-xl overflow-hidden border border-atria-gray-medium hover:shadow-lg transition-shadow"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <a href={vehiclePath(v)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-atria-gray-light">
          {v.fotos?.[0] ? (
            <img
              src={v.fotos[0]}
              alt={titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car size={48} className="text-atria-gray-medium" />
            </div>
          )}
          {v.destaque && (
            <span className="absolute top-3 left-3 bg-atria-yellow text-atria-navy text-xs font-inter font-bold uppercase px-2.5 py-1 rounded">
              Destaque
            </span>
          )}
        </div>
        <div className="p-5 pb-3">
          <p className="font-barlow-condensed font-bold text-lg text-atria-text-dark leading-tight mb-1">{titulo}</p>
          <p className="font-inter text-sm text-atria-text-gray mb-2">
            {v.ano} · {v.km?.toLocaleString("pt-BR")} km · {v.combustivel}
          </p>
          <span className="font-barlow-condensed font-black text-2xl text-atria-navy">{fmt(v.preco)}</span>
        </div>
      </a>
      <div className="px-5 pb-4 mt-2">
        <a
          href={vehiclePath(v)}
          className="block w-full text-center py-2.5 bg-atria-navy hover:bg-atria-navy/90 text-white font-inter font-bold text-sm uppercase tracking-wider rounded transition-colors"
        >
          Ver detalhes
        </a>
      </div>
    </motion.div>
  );
}

// ─── Venda seu Carro ─────────────────────────────────────────────────────────
function VendaSeuCarro() {
  const [form, setForm] = useState({ carro: "", nome: "", telefone: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 horas em segundos

  // Timer de urgência
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await saveLead({ nome: form.nome, whatsapp: form.telefone, source: "venda-carro", dados: { carro: form.carro } });
    setSending(false);
    setSent(true);
    setTimeout(() => {
      const msg = `Olá! Quero vender meu carro.\nCarro: ${form.carro}\nNome: ${form.nome}\nTelefone: ${form.telefone}`;
      window.open(waLink(msg), "_blank");
    }, 800);
  };

  return (
    <section className="py-20 bg-atria-navy">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-4">Avaliação Gratuita</p>
            <h2 className="section-title-white mb-6">
              Venda Seu Carro
              <br />
              <span className="text-atria-yellow">com Rapidez</span>
            </h2>

            {/* Urgência */}
            <div className="flex items-center gap-3 bg-atria-yellow/10 border border-atria-yellow/30 rounded-lg px-4 py-3 mb-6 w-fit">
              <Clock size={18} className="text-atria-yellow flex-shrink-0" />
              <div>
                <p className="font-inter text-atria-yellow text-xs font-semibold uppercase tracking-wider">
                  Avaliação em até 2 horas
                </p>
                <p className="font-barlow-condensed font-black text-xl text-white">
                  {formatTimer(timeLeft)}
                </p>
              </div>
            </div>

            <p className="font-inter text-white/70 text-base mb-6 leading-relaxed">
              Avaliamos o seu carro de forma justa e transparente. Receba uma proposta sem sair de casa.
            </p>
            <ul className="space-y-3">
              {["Avaliação presencial ou online", "Pagamento à vista em até 24h", "Documentação facilitada", "Sem taxas ou intermediários"].map((item) => (
                <li key={item} className="flex items-center gap-3 font-inter text-white/80">
                  <CheckCircle size={18} className="text-atria-yellow flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-2">
                  Recebemos! Abrindo WhatsApp...
                </h3>
                <p className="font-inter text-atria-text-gray text-sm">Nossa equipe entrará em contato em breve.</p>
              </div>
            ) : (
              <>
                <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-6">
                  Avalie Seu Veículo
                </h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Carro</label>
                    <input
                      type="text"
                      placeholder="Ex: Honda Civic 2020"
                      value={form.carro}
                      onChange={(e) => setForm({ ...form, carro: e.target.value })}
                      required
                      className="w-full border border-atria-gray-medium rounded px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Seu nome</label>
                    <input
                      type="text"
                      placeholder="João Silva"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      className="w-full border border-atria-gray-medium rounded px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(19) 99652-5211"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      required
                      className="w-full border border-atria-gray-medium rounded px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={sending} className="btn-yellow w-full rounded mt-2 disabled:opacity-60">
                    {sending ? "Enviando..." : "QUERO VENDER MEU CARRO"}
                  </button>
                  <p className="text-xs text-atria-text-gray text-center">
                    Seus dados são usados apenas para a avaliação do veículo.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Por que Átria ────────────────────────────────────────────────────────────
const DIFERENCIAIS = [
  { icon: <Shield size={32} />, title: "Veículos com Garantia", desc: "Todos os veículos passam por inspeção técnica completa e saem com garantia contratual." },
  { icon: <Award size={32} />, title: "12 Anos de Tradição", desc: "Mais de uma década no mercado de Campinas com milhares de clientes satisfeitos." },
  { icon: <Car size={32} />, title: "Mais de 200 Opções", desc: "Estoque diversificado de SUVs, sedans, hatches e picapes das melhores marcas." },
  { icon: <CheckCircle size={32} />, title: "Financiamento Facilitado", desc: "Parceiros com os principais bancos para aprovação rápida e taxas competitivas." },
];

function PorQueAtria() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="section-label mb-2">Nossos Diferenciais</p>
          <h2 className="section-title">Por que Escolher a Átria?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {DIFERENCIAIS.map((d, i) => (
            <motion.div key={d.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-atria-navy/5 text-atria-navy mb-5">
                {d.icon}
              </div>
              <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-2">{d.title}</h3>
              <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Como Funciona ────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Escolha seu veículo", desc: "Navegue pelo estoque online ou visite uma de nossas 3 lojas em Campinas." },
  { n: "02", title: "Faça a simulação", desc: "Use nosso simulador para entender as melhores condições de pagamento." },
  { n: "03", title: "Aprovação rápida", desc: "Nossa equipe agiliza o processo de financiamento com os principais bancos." },
  { n: "04", title: "Retire seu carro", desc: "Documentação pronta e carro preparado para você sair dirigindo." },
];

function ComoFunciona() {
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="section-label mb-2">Processo</p>
          <h2 className="section-title">Como Funciona</h2>
        </div>
        <div className="mb-10">
          <img
            src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=500&fit=crop"
            alt="Familia feliz com carro novo"
            className="w-full max-w-3xl mx-auto h-48 md:h-64 object-cover rounded-2xl shadow-md"
            loading="lazy"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-atria-gray-medium z-0" />
              )}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-atria-navy flex items-center justify-center mb-4">
                  <span className="font-barlow-condensed font-black text-lg text-atria-yellow">{s.n}</span>
                </div>
                <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-2">{s.title}</h3>
                <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function Stats() {
  return (
    <section className="bg-atria-navy py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: "Anos no mercado", value: 12 },
            { label: "Veículos vendidos", value: 10000, suffix: "+" },
            { label: "Veículos em estoque", value: 200, suffix: "+" },
            { label: "Lojas em Campinas", value: 3, suffix: "" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-barlow-condensed font-black text-5xl md:text-6xl text-atria-yellow">
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="font-inter text-sm text-white/60 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Brand Logo ──────────────────────────────────────────────────────────────
// Mapa unificado em lib/brandLogos.ts — mesmos arquivos usados pelo filtro
// do Estoque, garantindo consistência visual entre as duas seções.
function BrandLogo({ marca }: { marca: string }) {
  const url = brandLogoFor(marca);
  if (url) {
    return <img src={url} alt={marca} className="w-full h-full object-contain" loading="lazy" />;
  }
  // Fallback: iniciais num círculo pra marcas fora do mapa
  const initials = marca.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="20" fill="none" stroke="#6B7280" strokeWidth="2"/>
      <text x="24" y="30" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="14" fill="#6B7280">{initials}</text>
    </svg>
  );
}

// ─── Depoimentos (Google Reviews) ────────────────────────────────────────────

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AVATAR_COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#5F6368", "#1A73E8"];

function ReviewAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];

  if (photoUrl && !err) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        loading="lazy"
        onError={() => setErr(true)}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-inter font-bold text-sm"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function isRecent(publishTime: string): boolean {
  if (!publishTime) return false;
  const diff = Date.now() - new Date(publishTime).getTime();
  return diff < 60 * 24 * 60 * 60 * 1000; // 60 days
}

function ReviewCard({ r }: { r: import("@/hooks/useGoogleReviews").GoogleReview }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = r.text.length > 200;
  const displayText = shouldTruncate && !expanded ? r.text.slice(0, 200) + "..." : r.text;
  const recent = isRecent(r.publishTime);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col min-w-[280px] sm:min-w-0 snap-start">
      {/* Google logo + store badge */}
      <div className="flex items-center justify-between mb-3">
        {GOOGLE_ICON}
        <span className="font-inter text-[10px] font-semibold text-atria-text-gray bg-atria-gray-light rounded-full px-2 py-0.5 uppercase tracking-wider">
          {r.loja}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <ReviewAvatar name={r.authorName} photoUrl={r.authorPhoto} />
        <div className="min-w-0">
          <p className="font-inter font-semibold text-sm text-atria-text-dark truncate">{r.authorName}</p>
          <div className="flex items-center gap-1.5">
            <span className="font-inter text-xs text-atria-text-gray">{r.relativeTime}</span>
            {recent && (
              <span className="font-inter text-[9px] font-bold text-green-600 bg-green-50 rounded px-1.5 py-px uppercase">Nova</span>
            )}
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < r.rating ? "text-[#FBBC05] fill-[#FBBC05]" : "text-gray-200 fill-gray-200"} />
        ))}
      </div>

      {/* Text */}
      <p className="font-inter text-sm text-atria-text-gray leading-relaxed flex-1">
        {displayText}
        {shouldTruncate && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-atria-navy font-semibold ml-1 hover:underline"
          >
            Ler mais
          </button>
        )}
      </p>
    </div>
  );
}

function Depoimentos() {
  const { reviews, loading } = useGoogleReviews();

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="section-label mb-2">Depoimentos</p>
          <h2 className="section-title">O que Nossos Clientes Dizem</h2>
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-2 bg-gray-200 rounded w-1/2" /></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="space-y-1.5"><div className="h-3 bg-gray-200 rounded" /><div className="h-3 bg-gray-200 rounded w-5/6" /></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll. Desktop: grid */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:hidden">
              {reviews.map((r, i) => (
                <div key={i} className="w-[85vw] max-w-[320px] flex-shrink-0">
                  <ReviewCard r={r} />
                </div>
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reviews.slice(0, 6).map((r, i) => (
                <ReviewCard key={i} r={r} />
              ))}
            </div>
          </>
        )}

        {/* CTA: Ver todas no Google */}
        <div className="text-center mt-8">
          <a
            href="https://www.google.com/maps/search/%C3%81tria+Ve%C3%ADculos+Campinas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-inter text-sm font-semibold text-atria-navy hover:underline"
          >
            {GOOGLE_ICON}
            Ver todas as avaliações no Google
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
import { getPublishedBlogPosts, type BlogPost } from "@/lib/adminFirestore";

const CATEGORIA_LABELS: Record<string, string> = {
  comparativo: "Comparativo",
  "guia-preco": "Guia de Preço",
  review: "Review",
  financiamento: "Financiamento",
  "guia-perfil": "Guia",
};

function blogExcerpt(md: string, max = 120): string {
  return md.replace(/[#*_\[\]()>`-]/g, "").replace(/\n+/g, " ").trim().slice(0, max) + "...";
}

function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getPublishedBlogPosts()
      .then((p) => setPosts(p.slice(0, 3)))
      .catch((e) => console.error("[BlogSection] erro:", e));
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-label mb-2">Dicas & Conteudo</p>
            <h2 className="section-title">Blog Átria</h2>
          </div>
          <a href={ROUTES.blog} className="btn-outline-navy rounded text-sm whitespace-nowrap self-start">Ver todos →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p) => (
            <a key={p.slug} href={`/blog/${p.slug}`}
              className="group block border border-atria-gray-medium rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {p.capa ? (
                <div className="h-40 overflow-hidden">
                  <img src={p.capa} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="bg-atria-gray-light h-40 flex items-center justify-center">
                  <span className="font-barlow-condensed font-black text-5xl text-atria-gray-medium">{(CATEGORIA_LABELS[p.categoria] || "B")[0]}</span>
                </div>
              )}
              <div className="p-5">
                <span className="font-inter text-xs font-semibold text-atria-yellow uppercase tracking-wider">{CATEGORIA_LABELS[p.categoria] || p.categoria}</span>
                <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark mt-1 mb-2 leading-tight group-hover:text-atria-navy transition-colors">{p.titulo}</h3>
                <p className="font-inter text-sm text-atria-text-gray">{blogExcerpt(p.conteudo)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Vocês oferecem garantia nos veículos?", a: "Sim! Todos os veículos passam por inspeção técnica e saem com garantia contratual. Consulte as condições específicas de cada veículo." },
  { q: "Como funciona o financiamento?", a: "Trabalhamos com os principais bancos do mercado. A aprovação costuma sair em até 48 horas. Basta trazer seus documentos ou fazer a simulação online." },
  { q: "Vocês aceitam meu carro como parte do pagamento?", a: "Sim, fazemos a avaliação do seu veículo e podemos usá-lo como parte do pagamento. Agende uma avaliação gratuita." },
  { q: "Posso visitar a loja sem agendamento?", a: "Claro! Temos 3 lojas em Campinas: Abolição, Campos Elíseos e Guanabara. Funcionamos de segunda a sexta das 9h às 19h e sábados das 9h às 17h." },
  { q: "Os veículos têm procedência garantida?", a: "Sim. Verificamos histórico de sinistros, multas, alienação e débitos antes de colocar qualquer veículo em nosso estoque." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Dúvidas Frequentes</p>
          <h2 className="section-title">Perguntas & Respostas</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-atria-gray-medium">
              <button className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-inter font-semibold text-atria-text-dark pr-4">{faq.q}</span>
                <ChevronDown size={18}
                  className={`text-atria-text-gray flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contato ──────────────────────────────────────────────────────────────────
const LOJAS_CONTATO = [
  { nome: "Loja Abolição", endereco: "Rua Abolição, 1500 - VL Joaquim Inácio, Campinas-SP", telefone: "(19) 3199-2552" },
  { nome: "Loja Campos Elíseos", endereco: "R. Domício Pacheco e Silva, 1328 - Jd Campos Elíseos, Campinas-SP", telefone: "(19) 3500-8271" },
  { nome: "Loja Guanabara", endereco: "Av. Brasil, 1277 - Jd Guanabara, Campinas-SP", telefone: "(19) 3094-0015" },
];

function Contato() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.telefone) return;
    setSending(true);
    await saveLead({
      nome: form.nome,
      whatsapp: form.telefone,
      source: "contato-home",
      query: form.mensagem,
      dados: { email: form.email },
    });
    setSending(false);
    setSent(true);
  };

  return (
    <section id="contato" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Contato</p>
          <h2 className="section-title">Fale Conosco</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {LOJAS_CONTATO.map((loja) => (
            <div key={loja.nome} className="bg-atria-gray-light rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-atria-navy flex-shrink-0" />
                <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark">{loja.nome}</h3>
              </div>
              <p className="font-inter text-sm text-atria-text-gray mb-2">{loja.endereco}</p>
              <p className="font-inter text-sm text-atria-text-gray flex items-center gap-1.5">
                <Phone size={14} className="text-atria-navy" />
                {loja.telefone}
              </p>
              <p className="font-inter text-xs text-atria-text-gray mt-2 flex items-center gap-1.5">
                <Clock size={12} className="text-atria-navy" />
                Seg a Sex 9h-19h, Sab 9h-17h
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto">
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
              <p className="font-inter font-semibold text-atria-text-dark">Mensagem enviada com sucesso!</p>
              <p className="font-inter text-sm text-atria-text-gray mt-1">Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                />
              </div>
              <input
                type="tel"
                placeholder="Seu telefone"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                required
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
              />
              <textarea
                placeholder="Sua mensagem"
                rows={4}
                value={form.mensagem}
                onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value }))}
                className="w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-atria-navy hover:bg-atria-navy-dark text-white font-inter font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  return (
    <section className="py-24 bg-atria-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#002BB5_0%,_#001066_60%)]" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="section-label mb-4">Pronto para começar?</p>
        <h2 className="section-title-white mb-6 max-w-2xl mx-auto">
          Encontre o Veículo Perfeito
          <br />
          <span className="text-atria-yellow">para Você Hoje</span>
        </h2>
        <p className="font-inter text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Fale com nossos especialistas, faça sua simulação e saia dirigindo sem complicações.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowLeadModal(true)}
            className="btn-yellow rounded px-8"
          >
            Falar com especialista
          </button>
          <a href={ROUTES.estoque} className="btn-outline-white rounded px-8">
            Ver estoque completo
          </a>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 text-white/40 text-sm font-inter flex-wrap">
          <span className="flex items-center gap-2"><MapPin size={14} /> 3 lojas em Campinas, SP</span>
          <span className="flex items-center gap-2"><Phone size={14} /> (19) 99652-5211</span>
        </div>
      </div>

      <AnimatePresence>
        {showLeadModal && (
          <LeadModal
            title="Falar com especialista"
            subtitle="Deixe seu contato e um especialista entrará em contato em minutos."
            source="cta-final"
            prefillMsg="Olá! Vim pelo site da Átria e quero falar com um especialista sobre veículos."
            onClose={() => setShowLeadModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useSEO({
    title: "Átria Veículos | Carros Seminovos e Usados em Campinas SP",
    description: "Átria Veículos: concessionária de seminovos em Campinas-SP com mais de 12 anos de mercado e +10.000 carros vendidos. Mais de 200 veículos, 3 lojas e financiamento facilitado. BMW, Mercedes, Audi, Toyota e mais.",
    path: "/",
  });

  return (
    <>
      <HeroSection />
      <Simulador />
      <BrandCarousel />
      <EstoqueDestaque />
      <VendaSeuCarro />
      <PorQueAtria />
      <Stats />
      <Depoimentos />
      <BlogSection />
      <FAQ />
      <Contato />
      <CTAFinal />
    </>
  );
}
