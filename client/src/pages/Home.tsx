import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Star, Plus, Minus } from "lucide-react";
import { getFeaturedVehicles, type Vehicle } from "@/lib/firestore";

// ─── Constants ───────────────────────────────────────────────────────────────

const WA = "https://wa.me/5519999999999?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20veículos.";

const MARQUEE_ITEMS = [
  "🔒 Compra 100% Segura",
  "📋 Documentação Inclusa",
  "💳 Financiamento Fácil",
  "🏆 13 Anos de Mercado",
  "⭐ 2.000+ Clientes Satisfeitos",
  "🚗 Estoque Sempre Atualizado",
  "📍 3 Lojas em Campinas",
  "✅ Garantia em Todos os Veículos",
];

const DIFERENCIAIS = [
  { emoji: "🔒", title: "Compra Segura", desc: "Contrato transparente, sem letras miúdas. Você sabe exatamente o que está comprando." },
  { emoji: "📋", title: "Documentação OK", desc: "Todos os veículos com documentação em dia, histórico verificado e laudo cautelar." },
  { emoji: "💳", title: "Financiamento Fácil", desc: "Parceria com os principais bancos. Aprovação rápida com as melhores taxas do mercado." },
  { emoji: "🤝", title: "Pós-venda Ativo", desc: "Nosso relacionamento não termina na compra. Estamos aqui para qualquer necessidade." },
  { emoji: "🔍", title: "Inspeção Rigorosa", desc: "Cada veículo passa por inspeção técnica completa antes de entrar no nosso estoque." },
  { emoji: "📍", title: "3 Lojas em Campinas", desc: "Estamos onde você está. Venha nos visitar na loja mais próxima de você." },
];

const STEPS = [
  { num: "01", title: "Escolha seu Veículo", desc: "Navegue pelo nosso estoque completo online ou visite uma de nossas lojas. Temos o veículo ideal para você." },
  { num: "02", title: "Simulação Grátis", desc: "Faça uma simulação de financiamento sem compromisso. Encontramos o plano que cabe no seu bolso." },
  { num: "03", title: "Análise de Crédito", desc: "Aprovação rápida com nossos parceiros financeiros. Processo simples e sem burocracia." },
  { num: "04", title: "Retire seu Carro", desc: "Documentação pronta, carro revisado. É só buscar e sair dirigindo o seu novo veículo!" },
];

const STATS = [
  { value: 13, suffix: "+", label: "Anos de Mercado" },
  { value: 3, suffix: "", label: "Lojas em Campinas" },
  { value: 2000, suffix: "+", label: "Carros Vendidos" },
  { value: 98, suffix: "%", label: "Clientes Satisfeitos" },
];

const BRANDS = [
  "BMW", "Mercedes-Benz", "Audi", "Toyota", "Honda", "Volkswagen",
  "Hyundai", "Jeep", "Chevrolet", "Ford", "Nissan", "Mitsubishi",
];

const TESTIMONIALS = [
  { name: "Carlos M.", car: "BMW X3 2022", stars: 5, text: "Processo super transparente. Fiz o financiamento em 2 dias e saí com o carro muito bem cuidado. Recomendo demais!" },
  { name: "Ana Paula S.", car: "Toyota Corolla 2023", stars: 5, text: "Atendimento incrível desde o primeiro contato. A equipe da Átria realmente se preocupa com o cliente. Voltarei com certeza!" },
  { name: "Ricardo F.", car: "Jeep Renegade 2022", stars: 5, text: "Comprei meu carro sem sair de casa, pelo WhatsApp. Documentação em dia e entrega rápida. Excelente experiência!" },
];

const FAQS = [
  { q: "Como funciona o financiamento?", a: "Trabalhamos com os principais bancos e financeiras do Brasil. Você simula, escolhe o melhor plano e aprovamos em até 24 horas. Sem burocracia." },
  { q: "Os veículos têm garantia?", a: "Sim! Todos os veículos do nosso estoque passam por inspeção rigorosa e acompanham garantia. Consulte as condições para cada modelo." },
  { q: "Posso fazer uma avaliação do meu carro para troca?", a: "Claro! Avaliamos seu veículo gratuitamente e o valor pode ser usado como entrada na compra do seu próximo carro." },
  { q: "Vocês entregam em outra cidade?", a: "Sim, realizamos entregas em todo o estado de São Paulo. Entre em contato para verificar disponibilidade e condições." },
];

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// ─── Counter component ────────────────────────────────────────────────────────

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// ─── Vehicle card ─────────────────────────────────────────────────────────────

function VehicleCard({ v }: { v: Vehicle }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="group bg-white border border-atria-gray-medium rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-52 overflow-hidden bg-atria-gray-light">
        <img
          src={v.fotos[0] || "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&q=80"}
          alt={`${v.marca} ${v.modelo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-atria-yellow text-atria-navy text-xs font-barlow-condensed font-bold uppercase tracking-wider px-2.5 py-1 rounded">
          {v.ano}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-barlow-condensed text-xl font-bold uppercase text-atria-text-dark mb-1">
          {v.marca} {v.modelo}
        </h3>
        <p className="font-barlow text-sm text-atria-text-gray mb-4 line-clamp-2">{v.descricao}</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-atria-gray-light rounded px-3 py-2">
            <p className="text-atria-text-gray text-xs font-barlow">KM</p>
            <p className="font-barlow font-semibold text-sm text-atria-text-dark">{v.km.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-atria-gray-light rounded px-3 py-2">
            <p className="text-atria-text-gray text-xs font-barlow">Câmbio</p>
            <p className="font-barlow font-semibold text-sm text-atria-text-dark">{v.cambio}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-atria-gray-medium pt-4">
          <div>
            <p className="text-atria-text-gray text-xs font-barlow">Preço</p>
            <p className="font-barlow-condensed font-black text-2xl text-atria-navy">
              {v.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
            </p>
          </div>
          <a href={`/estoque/${v.slug}`} className="btn-navy rounded text-xs px-4 py-2">
            Ver
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative bg-atria-gray-light overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="section-label mb-3">
              A melhor concessionária de Campinas
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-barlow-condensed font-black uppercase text-5xl md:text-6xl lg:text-7xl leading-none text-atria-text-dark mb-5"
            >
              Seu próximo{" "}
              <span className="text-atria-navy">carro</span>
              <br />
              está aqui.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="font-barlow text-base md:text-lg text-atria-text-gray mb-8 max-w-md leading-relaxed"
            >
              Estoque premium, financiamento facilitado e atendimento que vai além da venda.
              Há 13 anos realizando sonhos em Campinas.
            </motion.p>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              {["✅ Contrato Seguro", "🏦 Financiamento Fácil", "📍 3 Lojas", "🔍 Laudo Cautelar"].map((b) => (
                <span key={b} className="bg-white border border-atria-gray-medium font-barlow text-sm font-semibold text-atria-text-dark px-4 py-2 rounded-full shadow-sm">
                  {b}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <a href="/estoque" className="btn-yellow rounded text-sm px-8 py-3.5 inline-flex items-center justify-center gap-2">
                Ver Estoque Completo <ChevronRight size={16} />
              </a>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-atria-navy text-atria-navy hover:bg-atria-navy hover:text-white font-barlow font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                Falar no WhatsApp
              </a>
            </motion.div>
          </motion.div>

          {/* Right: image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=85"
                alt="Veículo premium Átria"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-atria-navy/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p className="font-barlow text-xs text-atria-text-gray mb-0.5">Destaque da Semana</p>
                  <p className="font-barlow-condensed font-black text-xl text-atria-text-dark uppercase">
                    Mercedes-Benz C300 AMG
                  </p>
                  <p className="font-barlow-condensed font-bold text-2xl text-atria-navy">
                    R$ 249.900
                  </p>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-atria-yellow rounded-full p-4 shadow-xl text-center">
              <p className="font-barlow-condensed font-black text-2xl text-atria-navy leading-none">13+</p>
              <p className="font-barlow text-[10px] font-bold uppercase text-atria-navy leading-none">anos</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Marquee ─────────────────────────────────────────────────────────

function MarqueeSection() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <section className="bg-atria-navy py-4 overflow-hidden">
      <div className="flex animate-marquee gap-12 w-max">
        {items.map((item, i) => (
          <span key={i} className="font-barlow-condensed font-bold uppercase tracking-widest text-white/90 text-sm whitespace-nowrap flex items-center gap-3">
            {item}
            <span className="text-atria-yellow opacity-60">◆</span>
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Section: Estoque ─────────────────────────────────────────────────────────

function EstoqueSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Seleção premium</p>
          <h2 className="section-title mb-4">
            Nosso <span className="text-atria-navy">Estoque</span>
          </h2>
          <p className="font-barlow text-atria-text-gray max-w-xl mx-auto">
            Veículos cuidadosamente selecionados, inspecionados e prontos para você.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-atria-gray-light rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vehicles.slice(0, 3).map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mt-10"
        >
          <a href="/estoque" className="btn-navy rounded inline-flex items-center gap-2 px-8 py-3.5">
            Ver Estoque Completo <ChevronRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: Por que a Átria ─────────────────────────────────────────────────

function PorQueAtriaSection() {
  return (
    <section className="py-20 bg-atria-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Nossos diferenciais</p>
          <h2 className="section-title-white mb-4">
            Por que escolher a <span className="text-atria-yellow">Átria?</span>
          </h2>
          <p className="font-barlow text-white/60 max-w-xl mx-auto">
            Mais do que vender carros — construímos relacionamentos baseados em confiança.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {DIFERENCIAIS.map(({ emoji, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-atria-yellow/40 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="font-barlow-condensed font-bold text-xl uppercase text-white mb-2">
                {title}
              </h3>
              <p className="font-barlow text-sm text-white/60 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: Como Funciona ───────────────────────────────────────────────────

function ComoFuncionaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Simples assim</p>
          <h2 className="section-title mb-4">
            Como <span className="text-atria-navy">Funciona</span>
          </h2>
          <p className="font-barlow text-atria-text-gray max-w-xl mx-auto">
            Do interesse à chave na mão em poucos passos.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STEPS.map(({ num, title, desc }, i) => (
            <motion.div key={num} variants={fadeUp} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-atria-gray-medium z-0 -translate-x-1/2" />
              )}
              <div className="relative z-10 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-atria-navy rounded-full mb-5">
                  <span className="font-barlow-condensed font-black text-xl text-atria-yellow">{num}</span>
                </div>
                <h3 className="font-barlow-condensed font-bold uppercase text-lg text-atria-text-dark mb-2">
                  {title}
                </h3>
                <p className="font-barlow text-sm text-atria-text-gray leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mt-12"
        >
          <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-yellow rounded inline-flex items-center gap-2 px-8 py-3.5">
            Iniciar Processo <ChevronRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: Stats ───────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="py-16 bg-atria-gray-light border-y border-atria-gray-medium">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {STATS.map(({ value, suffix, label }) => (
            <motion.div key={label} variants={fadeUp}>
              <p className="font-barlow-condensed font-black text-5xl md:text-6xl text-atria-navy leading-none mb-2">
                <Counter value={value} suffix={suffix} />
              </p>
              <p className="font-barlow text-sm font-semibold uppercase tracking-widest text-atria-text-gray">
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: Marcas ─────────────────────────────────────────────────────────

function MarcasSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-10"
        >
          <p className="section-label mb-3">Trabalhamos com</p>
          <h2 className="section-title">
            Principais <span className="text-atria-navy">Marcas</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {BRANDS.map((brand) => (
            <motion.a
              key={brand}
              href={`/estoque?marca=${encodeURIComponent(brand)}`}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center h-16 border border-atria-gray-medium rounded-lg hover:border-atria-navy hover:bg-atria-gray-light transition-all"
            >
              <span className="font-barlow-condensed font-bold text-sm uppercase tracking-wide text-atria-text-gray hover:text-atria-navy transition-colors">
                {brand}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: Calculadora ─────────────────────────────────────────────────────

function CalculadoraSection() {
  const [valor, setValor] = useState(100000);
  const [entrada, setEntrada] = useState(20);
  const [prazo, setPrazo] = useState(48);
  const taxa = 0.0159; // ~1.59% a.m.

  const principal = valor * (1 - entrada / 100);
  const n = prazo;
  const parcela = principal > 0
    ? (principal * taxa * Math.pow(1 + taxa, n)) / (Math.pow(1 + taxa, n) - 1)
    : 0;

  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="section-label mb-3">Sem compromisso</p>
            <h2 className="section-title mb-4">
              Simulador de <span className="text-atria-navy">Financiamento</span>
            </h2>
            <p className="font-barlow text-atria-text-gray">
              Calcule uma estimativa da sua parcela mensal. Taxas reais mediante análise de crédito.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Inputs */}
              <div className="p-8 border-b lg:border-b-0 lg:border-r border-atria-gray-medium">
                <div className="space-y-7">
                  {/* Valor */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-barlow font-semibold text-sm uppercase tracking-wider text-atria-text-gray">
                        Valor do Veículo
                      </label>
                      <span className="font-barlow-condensed font-bold text-atria-navy">{fmtBRL(valor)}</span>
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={500000}
                      step={5000}
                      value={valor}
                      onChange={(e) => setValor(Number(e.target.value))}
                      className="w-full accent-atria-navy h-2 rounded"
                    />
                    <div className="flex justify-between text-xs text-atria-text-gray font-barlow mt-1">
                      <span>R$ 30k</span><span>R$ 500k</span>
                    </div>
                  </div>

                  {/* Entrada */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-barlow font-semibold text-sm uppercase tracking-wider text-atria-text-gray">
                        Entrada
                      </label>
                      <span className="font-barlow-condensed font-bold text-atria-navy">
                        {entrada}% — {fmtBRL(valor * entrada / 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={70}
                      step={5}
                      value={entrada}
                      onChange={(e) => setEntrada(Number(e.target.value))}
                      className="w-full accent-atria-navy h-2 rounded"
                    />
                    <div className="flex justify-between text-xs text-atria-text-gray font-barlow mt-1">
                      <span>10%</span><span>70%</span>
                    </div>
                  </div>

                  {/* Prazo */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-barlow font-semibold text-sm uppercase tracking-wider text-atria-text-gray">
                        Prazo
                      </label>
                      <span className="font-barlow-condensed font-bold text-atria-navy">{prazo} meses</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={72}
                      step={12}
                      value={prazo}
                      onChange={(e) => setPrazo(Number(e.target.value))}
                      className="w-full accent-atria-navy h-2 rounded"
                    />
                    <div className="flex justify-between text-xs text-atria-text-gray font-barlow mt-1">
                      <span>12x</span><span>72x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="p-8 flex flex-col justify-between bg-atria-navy">
                <div>
                  <p className="section-label mb-4 text-atria-yellow">Estimativa de parcela</p>
                  <p className="font-barlow-condensed font-black text-6xl text-white leading-none mb-1">
                    {fmtBRL(parcela)}
                  </p>
                  <p className="font-barlow text-white/60 text-sm mb-8">por mês · taxa ref. 1,59% a.m.</p>

                  <div className="space-y-3 text-sm font-barlow">
                    {[
                      ["Valor financiado", fmtBRL(principal)],
                      ["Total de parcelas", `${prazo}x`],
                      ["Total a pagar", fmtBRL(parcela * prazo)],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-white/70 border-b border-white/10 pb-2">
                        <span>{label}</span>
                        <span className="font-semibold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-yellow rounded mt-8 text-center block"
                >
                  Solicitar Financiamento
                </a>
                <p className="font-barlow text-white/40 text-xs text-center mt-3">
                  Simulação sem compromisso. Taxas sujeitas a análise de crédito.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Depoimentos ─────────────────────────────────────────────────────

function DepoimentosSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Quem já comprou</p>
          <h2 className="section-title mb-4">
            O que nossos <span className="text-atria-navy">Clientes</span> dizem
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map(({ name, car, stars, text }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              className="bg-atria-gray-light border border-atria-gray-medium rounded-xl p-7 relative"
            >
              <span className="absolute top-5 right-6 text-5xl text-atria-navy/10 font-serif leading-none select-none">"</span>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={16} className="fill-atria-yellow text-atria-yellow" />
                ))}
              </div>
              <p className="font-barlow text-atria-text-dark leading-relaxed mb-6 text-sm">"{text}"</p>
              <div className="border-t border-atria-gray-medium pt-4">
                <p className="font-barlow-condensed font-bold text-base text-atria-text-dark uppercase">{name}</p>
                <p className="font-barlow text-xs text-atria-text-gray">{car}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: FAQ ─────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <p className="section-label mb-3">Tire suas dúvidas</p>
          <h2 className="section-title">
            Perguntas <span className="text-atria-navy">Frequentes</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-3"
        >
          {FAQS.map(({ q, a }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white border border-atria-gray-medium rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-barlow-condensed font-bold text-lg text-atria-text-dark uppercase pr-4">
                  {q}
                </span>
                <span className="flex-shrink-0 text-atria-navy">
                  {open === i ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 pt-0">
                  <p className="font-barlow text-sm text-atria-text-gray leading-relaxed border-t border-atria-gray-medium pt-4">
                    {a}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section: CTA Final ───────────────────────────────────────────────────────

function CTAFinalSection() {
  return (
    <section id="contato" className="py-24 bg-atria-navy-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-atria-yellow rounded-full filter blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full filter blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-2xl mx-auto"
        >
          <motion.p variants={fadeUp} className="section-label mb-4">
            Pronto para comprar?
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-barlow-condensed font-black text-5xl md:text-6xl uppercase text-white leading-tight mb-5"
          >
            Encontre seu carro <span className="text-atria-yellow">hoje.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="font-barlow text-white/60 text-lg mb-10">
            Nossa equipe está pronta para te ajudar a encontrar o veículo ideal,
            com o melhor financiamento e sem complicação.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/estoque" className="btn-yellow rounded px-10 py-4 inline-flex items-center gap-2 justify-center text-base">
              Ver Estoque <ChevronRight size={18} />
            </a>
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-white rounded px-10 py-4 inline-flex items-center gap-2 justify-center text-base"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
              </svg>
              Falar no WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page: Home ───────────────────────────────────────────────────────────────

export function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <EstoqueSection />
      <PorQueAtriaSection />
      <ComoFuncionaSection />
      <StatsSection />
      <MarcasSection />
      <CalculadoraSection />
      <DepoimentosSection />
      <FAQSection />
      <CTAFinalSection />
    </>
  );
}
