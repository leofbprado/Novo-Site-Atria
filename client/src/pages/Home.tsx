import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown, Search, ArrowRight, Star, CheckCircle, Car, Shield, Award, Phone, MapPin } from "lucide-react";
import { getFeaturedVehicles, type Vehicle } from "@/lib/firestore";

// ─── Hero ────────────────────────────────────────────────────────────────────
const HERO_BG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1920&q=80";

function Hero() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"compre" | "venda" | "financie">("compre");

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-atria-navy/75" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="section-label mb-4 text-atria-yellow">Campinas • SP</p>
          <h1 className="font-barlow-condensed font-black text-5xl md:text-7xl uppercase text-white leading-none mb-4">
            Encontre Seu
            <br />
            <span className="text-atria-yellow">Próximo Carro</span>
          </h1>
          <p className="font-inter text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Mais de 200 veículos selecionados com garantia, procedência e as melhores condições de financiamento.
          </p>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-2 mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {(["compre", "venda", "financie"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-inter font-bold uppercase tracking-wider text-sm rounded transition-all ${
                activeTab === tab
                  ? "bg-atria-yellow text-atria-navy"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              {tab === "compre" ? "Compre" : tab === "venda" ? "Venda" : "Financie"}
            </button>
          ))}
        </motion.div>

        <motion.form
          className="flex gap-0 rounded overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/estoque?q=${encodeURIComponent(query)}`;
          }}
        >
          <input
            type="text"
            placeholder="Buscar marca, modelo ou ano..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-5 py-4 font-inter text-atria-text-dark text-base bg-white outline-none"
          />
          <button
            type="submit"
            className="bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy px-7 py-4 font-inter font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Search size={18} />
            Buscar
          </button>
        </motion.form>

        <motion.div
          className="flex items-center justify-center gap-4 mt-5 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {["SUV", "Sedan", "Hatch", "Pickup", "Elétrico"].map((tag) => (
            <a
              key={tag}
              href={`/estoque?tipo=${tag.toLowerCase()}`}
              className="font-inter text-xs text-white/60 hover:text-atria-yellow transition-colors uppercase tracking-wider"
            >
              {tag}
            </a>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown size={28} className="text-white/40" />
      </motion.div>
    </section>
  );
}

// ─── Simulador ───────────────────────────────────────────────────────────────
function Simulador() {
  const [parcela, setParcela] = useState(1500);
  const [entrada, setEntrada] = useState(10000);
  const [prazo, setPrazo] = useState(48);
  const [perfil, setPerfil] = useState<"alto" | "medio" | "baixo">("medio");

  const taxa = perfil === "alto" ? 0.0099 : perfil === "medio" ? 0.0149 : 0.0199;
  const pvFactor = (Math.pow(1 + taxa, prazo) - 1) / (taxa * Math.pow(1 + taxa, prazo));
  const valorFinanciado = parcela * pvFactor;
  const valorVeiculo = Math.round(valorFinanciado + entrada);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <section className="bg-atria-gray-light py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Simulador</p>
          <h2 className="section-title">
            Quanto Cabe
            <br />
            no Seu Bolso?
          </h2>
          <p className="font-inter text-atria-text-gray mt-3 max-w-lg mx-auto">
            Ajuste os parâmetros e descubra o valor do veículo ideal para você.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Inputs */}
          <div className="bg-white rounded-xl p-8 shadow-sm space-y-7">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-inter font-semibold text-sm text-atria-text-dark">Parcela desejada</label>
                <span className="font-barlow-condensed font-bold text-lg text-atria-navy">{fmt(parcela)}</span>
              </div>
              <input
                type="range" min={500} max={5000} step={100}
                value={parcela}
                onChange={(e) => setParcela(Number(e.target.value))}
                className="w-full accent-atria-navy"
              />
              <div className="flex justify-between text-xs text-atria-text-gray mt-1">
                <span>{fmt(500)}</span><span>{fmt(5000)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-inter font-semibold text-sm text-atria-text-dark">Valor de entrada</label>
                <span className="font-barlow-condensed font-bold text-lg text-atria-navy">{fmt(entrada)}</span>
              </div>
              <input
                type="range" min={0} max={50000} step={1000}
                value={entrada}
                onChange={(e) => setEntrada(Number(e.target.value))}
                className="w-full accent-atria-navy"
              />
              <div className="flex justify-between text-xs text-atria-text-gray mt-1">
                <span>{fmt(0)}</span><span>{fmt(50000)}</span>
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-atria-text-dark block mb-2">Prazo</label>
              <div className="flex gap-2">
                {[24, 36, 48, 60].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrazo(p)}
                    className={`flex-1 py-2 font-inter text-sm font-semibold rounded transition-all ${
                      prazo === p
                        ? "bg-atria-navy text-white"
                        : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
                    }`}
                  >
                    {p}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-atria-text-dark block mb-2">Perfil de crédito</label>
              <div className="flex gap-2">
                {(["alto", "medio", "baixo"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPerfil(p)}
                    className={`flex-1 py-2 font-inter text-sm font-semibold rounded capitalize transition-all ${
                      perfil === p
                        ? "bg-atria-yellow text-atria-navy"
                        : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
                    }`}
                  >
                    {p === "alto" ? "Ótimo" : p === "medio" ? "Bom" : "Regular"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="bg-atria-navy rounded-xl p-8 flex flex-col justify-between text-white">
            <div>
              <p className="font-inter text-white/60 text-sm uppercase tracking-widest mb-6">Resultado da simulação</p>
              <div className="space-y-5">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="font-inter text-white/70">Veículo estimado até:</span>
                  <span className="font-barlow-condensed font-black text-4xl text-atria-yellow">{fmt(valorVeiculo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Entrada</span>
                  <span className="font-semibold">{fmt(entrada)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Parcelas</span>
                  <span className="font-semibold">{prazo}x de {fmt(parcela)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Taxa aprox.</span>
                  <span className="font-semibold">{(taxa * 100).toFixed(2)}% a.m.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a href="/estoque" className="btn-yellow w-full text-center block rounded">
                Ver veículos nessa faixa
              </a>
              <a href="/financiamento" className="btn-outline-white w-full text-center block rounded text-sm">
                Fazer simulação completa
              </a>
              <p className="text-white/40 text-xs text-center">
                * Simulação meramente indicativa. Sujeito à aprovação de crédito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
const TICKER_ITEMS = ["BMW", "Mercedes-Benz", "Audi", "Toyota", "Honda", "Volkswagen", "Chevrolet", "Jeep", "Ford", "Hyundai", "Nissan", "Volvo"];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="bg-atria-navy py-4 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {items.map((marca, i) => (
          <span key={i} className="font-barlow-condensed font-black text-lg uppercase tracking-widest text-white/30">
            {marca}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Estoque em Destaque ──────────────────────────────────────────────────────
const TIPO_TABS = ["Todos", "SUV", "Sedan", "Hatch", "Pickup"] as const;
type TipoTab = typeof TIPO_TABS[number];

function EstoqueDestaque() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tab, setTab] = useState<TipoTab>("Todos");

  useEffect(() => {
    getFeaturedVehicles().then(setVehicles);
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
          <a href="/estoque" className="btn-outline-navy rounded text-sm whitespace-nowrap self-start">
            Ver todos <ArrowRight size={14} className="inline ml-1" />
          </a>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {TIPO_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 font-inter font-semibold text-sm rounded-full transition-all ${
                tab === t
                  ? "bg-atria-navy text-white"
                  : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((v) => (
            <motion.a
              key={v.id}
              href={`/veiculo/${v.slug}`}
              className="group bg-white rounded-xl overflow-hidden border border-atria-gray-medium hover:shadow-lg transition-shadow"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-atria-gray-light">
                {v.fotos?.[0] ? (
                  <img
                    src={v.fotos[0]}
                    alt={v.titulo ?? `${v.marca} ${v.modelo}`}
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
              <div className="p-5">
                <p className="font-barlow-condensed font-bold text-lg text-atria-text-dark leading-tight mb-1">
                  {v.titulo ?? `${v.marca} ${v.modelo}`}
                </p>
                <p className="font-inter text-sm text-atria-text-gray mb-3">
                  {v.ano} · {v.km?.toLocaleString("pt-BR")} km · {v.combustivel}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-barlow-condensed font-black text-2xl text-atria-navy">
                    {fmt(v.preco)}
                  </span>
                  <span className="font-inter text-xs text-atria-text-gray bg-atria-gray-light px-3 py-1 rounded-full">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {displayed.length === 0 && (
          <p className="text-center text-atria-text-gray font-inter py-12">
            Nenhum veículo nessa categoria no momento.{" "}
            <a href="/estoque" className="text-atria-navy underline">Ver todos</a>
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Venda seu Carro ─────────────────────────────────────────────────────────
function VendaSeuCarro() {
  const [form, setForm] = useState({ placa: "", nome: "", telefone: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá! Quero vender meu carro.\nPlaca: ${form.placa}\nNome: ${form.nome}\nTelefone: ${form.telefone}`;
    window.open(`https://wa.me/5519999999999?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
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
            <p className="font-inter text-white/70 text-lg mb-8 leading-relaxed">
              Avaliamos o seu carro de forma justa e transparente. Receba uma proposta em menos de 24 horas e venda sem burocracia.
            </p>
            <ul className="space-y-3">
              {[
                "Avaliação presencial ou online",
                "Pagamento à vista em até 24h",
                "Documentação facilitada",
                "Sem taxas ou intermediários",
              ].map((item) => (
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
                <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-2">
                  Recebemos seu interesse!
                </h3>
                <p className="font-inter text-atria-text-gray">
                  Você será redirecionado ao WhatsApp. Aguarde nosso contato em breve.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark mb-6">
                  Avalie Seu Veículo
                </h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">
                      Placa do veículo
                    </label>
                    <input
                      type="text"
                      placeholder="ABC-1234"
                      value={form.placa}
                      onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
                      required
                      className="w-full border border-atria-gray-medium rounded px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">
                      Seu nome
                    </label>
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
                    <label className="font-inter text-sm font-semibold text-atria-text-dark block mb-1.5">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="(19) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      required
                      className="w-full border border-atria-gray-medium rounded px-4 py-3 font-inter text-sm outline-none focus:border-atria-navy transition-colors"
                    />
                  </div>
                  <button type="submit" className="btn-yellow w-full rounded mt-2">
                    Quero vender meu carro
                  </button>
                  <p className="text-xs text-atria-text-gray text-center">
                    Seus dados são usados apenas para entrar em contato sobre a avaliação.
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

// ─── Por que Átria ───────────────────────────────────────────────────────────
const DIFERENCIAIS = [
  {
    icon: <Shield size={32} />,
    title: "Veículos com Garantia",
    desc: "Todos os veículos passam por inspeção técnica completa e saem com garantia contratual.",
  },
  {
    icon: <Award size={32} />,
    title: "13 Anos de Tradição",
    desc: "Mais de uma década no mercado de Campinas com milhares de clientes satisfeitos.",
  },
  {
    icon: <Car size={32} />,
    title: "Mais de 200 Opções",
    desc: "Estoque diversificado de SUVs, sedans, hatches e picapes das melhores marcas.",
  },
  {
    icon: <CheckCircle size={32} />,
    title: "Financiamento Facilitado",
    desc: "Parceiros com os principais bancos para aprovação rápida e taxas competitivas.",
  },
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
            <motion.div
              key={d.title}
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

// ─── Como Funciona ───────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Escolha seu veículo", desc: "Navegue pelo estoque online ou visite nossa loja em Campinas." },
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
    let start = 0;
    const step = (target / 1800) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function Stats() {
  return (
    <section className="bg-atria-navy py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { label: "Anos no mercado", value: 13 },
            { label: "Veículos vendidos", value: 5000, suffix: "+" },
            { label: "Clientes satisfeitos", value: 4800, suffix: "+" },
            { label: "Veículos em estoque", value: 200, suffix: "+" },
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

// ─── Marcas ───────────────────────────────────────────────────────────────────
const MARCAS_GRID = [
  { nome: "BMW", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/2048px-BMW.svg.png" },
  { nome: "Mercedes", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/2048px-Mercedes-Logo.svg.png" },
  { nome: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/2560px-Audi-Logo_2016.svg.png" },
  { nome: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/1280px-Toyota_carlogo.svg.png" },
  { nome: "Honda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/1200px-Honda.svg.png" },
  { nome: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1280px-Volkswagen_logo_2019.svg.png" },
];

function Marcas() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Marcas</p>
          <h2 className="section-title">As Melhores Marcas do Mercado</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {MARCAS_GRID.map((m) => (
            <a
              key={m.nome}
              href={`/estoque?marca=${m.nome}`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-atria-gray-light transition-colors group"
            >
              <img
                src={m.logo}
                alt={m.nome}
                className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100"
                loading="lazy"
              />
              <span className="font-inter text-xs text-atria-text-gray group-hover:text-atria-navy transition-colors">
                {m.nome}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Depoimentos ─────────────────────────────────────────────────────────────
const DEPOIMENTOS = [
  {
    nome: "Carlos Mendonça",
    cargo: "Empresário",
    texto: "Comprei meu BMW X5 na Átria e a experiência foi incrível. Transparência total, sem surpresas. Recomendo demais!",
    nota: 5,
  },
  {
    nome: "Ana Paula Ribeiro",
    cargo: "Médica",
    texto: "Processo de financiamento super ágil. Em 3 dias estava com o carro. Equipe muito atenciosa e profissional.",
    nota: 5,
  },
  {
    nome: "Roberto Alves",
    cargo: "Engenheiro",
    texto: "Já é minha segunda compra na Átria. Voltei porque confio no trabalho deles. Preço justo e qualidade garantida.",
    nota: 5,
  },
];

function Depoimentos() {
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-label mb-2">Depoimentos</p>
          <h2 className="section-title">O que Nossos Clientes Dizem</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DEPOIMENTOS.map((d) => (
            <div key={d.nome} className="bg-white rounded-xl p-7 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: d.nota }).map((_, i) => (
                  <Star key={i} size={16} className="text-atria-yellow fill-atria-yellow" />
                ))}
              </div>
              <p className="font-inter text-atria-text-gray text-sm leading-relaxed mb-5">"{d.texto}"</p>
              <div>
                <p className="font-inter font-semibold text-sm text-atria-text-dark">{d.nome}</p>
                <p className="font-inter text-xs text-atria-text-gray">{d.cargo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
const POSTS = [
  {
    titulo: "Como escolher o melhor financiamento para seu carro",
    resumo: "Entenda as diferenças entre CDC, leasing e consórcio para tomar a melhor decisão.",
    tag: "Financiamento",
    href: "/blog/financiamento-carro",
  },
  {
    titulo: "SUV ou Sedan: qual o melhor para sua família?",
    resumo: "Comparamos os dois tipos mais populares para ajudar você a escolher o certo.",
    tag: "Dicas",
    href: "/blog/suv-ou-sedan",
  },
  {
    titulo: "5 coisas que você precisa verificar antes de comprar um usado",
    resumo: "Checklist completo para não cair em armadilhas na hora de comprar um seminovo.",
    tag: "Guia",
    href: "/blog/checklist-usado",
  },
];

function Blog() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-label mb-2">Dicas & Conteúdo</p>
            <h2 className="section-title">Blog Átria</h2>
          </div>
          <a href="/blog" className="btn-outline-navy rounded text-sm whitespace-nowrap self-start">
            Ver todos os artigos →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POSTS.map((p) => (
            <a
              key={p.titulo}
              href={p.href}
              className="group block border border-atria-gray-medium rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-atria-gray-light h-40 flex items-center justify-center">
                <span className="font-barlow-condensed font-black text-5xl text-atria-gray-medium">
                  {p.tag[0]}
                </span>
              </div>
              <div className="p-5">
                <span className="font-inter text-xs font-semibold text-atria-yellow uppercase tracking-wider">
                  {p.tag}
                </span>
                <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark mt-1 mb-2 leading-tight group-hover:text-atria-navy transition-colors">
                  {p.titulo}
                </h3>
                <p className="font-inter text-sm text-atria-text-gray">{p.resumo}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Vocês oferecem garantia nos veículos?", a: "Sim! Todos os veículos passam por inspeção técnica e saem com garantia contratual. Consulte as condições específicas de cada veículo." },
  { q: "Como funciona o financiamento?", a: "Trabalhamos com os principais bancos do mercado. Basta trazer seus documentos à loja ou fazer a simulação online. A aprovação costuma sair em até 48 horas." },
  { q: "Vocês aceitam meu carro como parte do pagamento?", a: "Sim, fazemos a avaliação do seu veículo e podemos usá-lo como parte do pagamento. Agende uma avaliação gratuita." },
  { q: "Posso visitar a loja sem agendamento?", a: "Claro! Nossa loja em Campinas funciona de segunda a sexta das 9h às 19h e aos sábados das 9h às 17h. Pode vir quando quiser." },
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
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-inter font-semibold text-atria-text-dark pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-atria-text-gray flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                />
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

// ─── CTA Final ────────────────────────────────────────────────────────────────
const WHATSAPP = "https://wa.me/5519999999999?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20veículos.";

function CTAFinal() {
  return (
    <section className="py-24 bg-atria-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1a237e_0%,_#0d1355_60%)]" />
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
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-yellow rounded px-8">
            Falar com especialista
          </a>
          <a href="/estoque" className="btn-outline-white rounded px-8">
            Ver estoque completo
          </a>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 text-white/40 text-sm font-inter flex-wrap">
          <span className="flex items-center gap-2"><MapPin size={14} /> Campinas, SP</span>
          <span className="flex items-center gap-2"><Phone size={14} /> (19) 99999-9999</span>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <Simulador />
      <Marquee />
      <EstoqueDestaque />
      <VendaSeuCarro />
      <PorQueAtria />
      <ComoFunciona />
      <Stats />
      <Marcas />
      <Depoimentos />
      <Blog />
      <FAQ />
      <CTAFinal />
    </>
  );
}
