import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, TrendingDown, Clock, CreditCard, Calendar,
  FileText, CheckCircle, Car, Send, Shield,
} from "lucide-react";
import { saveLead } from "@/lib/firestore";

const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

// ---- SEO -------------------------------------------------------------------
function useSEO() {
  useEffect(() => {
    document.title = "Financiamento | Atria Veiculos - Campinas SP";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Financiamento facilitado para seminovos na Atria Veiculos. Taxas a partir de 0.99%/mes, aprovacao em 24h, ate 60x. Simule agora!");
  }, []);
}

// ---- Hero ------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative bg-atria-navy py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=600&fit=crop)" }}
      />
      <div className="absolute inset-0 bg-atria-navy/80" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-inter text-atria-yellow text-xs uppercase tracking-widest font-bold mb-4">Financiamento</p>
          <h1 className="font-barlow-condensed font-black text-4xl md:text-6xl text-white uppercase leading-none mb-4">
            Financiamento <span className="text-atria-yellow">Facilitado</span>
          </h1>
          <p className="font-inter text-white/70 text-lg max-w-xl mx-auto">
            As melhores taxas do mercado com aprovacao em ate 24h
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Simulador (inline) ----------------------------------------------------
function Simulador() {
  const [parcela, setParcela] = useState(1500);
  const [entrada, setEntrada] = useState(10000);
  const [prazo, setPrazo] = useState(48);
  const [showCTA, setShowCTA] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const interacted = useRef(false);

  const valorVeiculo = Math.round(parcela * prazo + entrada);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const handleInteraction = () => {
    if (!interacted.current) {
      interacted.current = true;
      setTimeout(() => setShowCTA(true), 2000);
    }
  };

  const handleLead = async () => {
    await saveLead({
      source: "financiamento-simulador",
      whatsapp: "",
      query: `Simulacao: parcela ${fmt(parcela)}, entrada ${fmt(entrada)}, prazo ${prazo}x, veiculo ${fmt(valorVeiculo)}`,
    });
    setShowLead(false);
    window.open(
      waLink(`Ola! Fiz uma simulacao no site: parcela ${fmt(parcela)}, entrada ${fmt(entrada)}, ${prazo}x. Veiculo ate ${fmt(valorVeiculo)}. Quero saber mais!`),
      "_blank"
    );
  };

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Simulador</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Quanto Cabe no Seu Bolso?
          </h2>
          <p className="font-inter text-atria-text-gray mt-3 max-w-lg mx-auto">
            Ajuste os parametros e descubra o valor do veiculo ideal para voce.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm space-y-7" onChange={handleInteraction}>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-inter font-semibold text-sm text-atria-text-dark">Parcela desejada</label>
                <span className="font-barlow-condensed font-bold text-lg text-atria-navy">{fmt(parcela)}</span>
              </div>
              <input type="range" min={500} max={5000} step={100} value={parcela}
                onChange={(e) => { setParcela(Number(e.target.value)); handleInteraction(); }}
                className="w-full accent-atria-navy" />
              <div className="flex justify-between text-xs text-atria-text-gray mt-1">
                <span>{fmt(500)}</span><span>{fmt(5000)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-inter font-semibold text-sm text-atria-text-dark">Valor de entrada</label>
                <span className="font-barlow-condensed font-bold text-lg text-atria-navy">{fmt(entrada)}</span>
              </div>
              <input type="range" min={0} max={50000} step={1000} value={entrada}
                onChange={(e) => { setEntrada(Number(e.target.value)); handleInteraction(); }}
                className="w-full accent-atria-navy" />
              <div className="flex justify-between text-xs text-atria-text-gray mt-1">
                <span>{fmt(0)}</span><span>{fmt(50000)}</span>
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-atria-text-dark block mb-2">Prazo</label>
              <div className="flex gap-2">
                {[24, 36, 48, 60].map((p) => (
                  <button key={p} onClick={() => { setPrazo(p); handleInteraction(); }}
                    className={`flex-1 py-2 font-inter text-sm font-semibold rounded transition-all ${
                      prazo === p ? "bg-atria-navy text-white" : "bg-atria-gray-light text-atria-text-dark hover:bg-atria-gray-medium"
                    }`}>{p}x</button>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-atria-navy rounded-xl p-8 flex flex-col justify-between text-white">
            <div>
              <p className="font-inter text-white/60 text-sm uppercase tracking-widest mb-6">Resultado da simulacao</p>
              <div className="space-y-5">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="font-inter text-white/70">Veiculo estimado ate:</span>
                  <span className="font-barlow-condensed font-black text-4xl text-atria-yellow">{fmt(valorVeiculo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Parcela</span>
                  <span className="font-semibold">{fmt(parcela)}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Entrada</span>
                  <span className="font-semibold">{fmt(entrada)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Prazo</span>
                  <span className="font-semibold">{prazo} meses</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showCTA && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 space-y-3"
                >
                  <button
                    onClick={() => setShowLead(true)}
                    className="w-full bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy font-inter font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-colors"
                  >
                    Quero financiar!
                  </button>
                  <a href="/estoque" className="block text-center font-inter text-white/60 hover:text-white text-sm underline underline-offset-2">
                    Ver veiculos nessa faixa
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {showLead && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60" onClick={() => setShowLead(false)} />
                <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-atria-text-dark">
                  <h3 className="font-barlow-condensed font-black text-2xl mb-2">Falar com especialista</h3>
                  <p className="font-inter text-sm text-atria-text-gray mb-4">Vamos encaminhar voce ao WhatsApp com os dados da simulacao.</p>
                  <button onClick={handleLead} className="w-full bg-green-500 hover:bg-green-600 text-white font-inter font-bold uppercase text-sm py-3 rounded-xl transition-colors">
                    Abrir WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Vantagens -------------------------------------------------------------
function Vantagens() {
  const cards = [
    { icon: <TrendingDown size={28} />, title: "Taxas a partir de 0.99%/mes", desc: "Trabalhamos com os melhores bancos para garantir taxas competitivas.", disclaimer: true },
    { icon: <Clock size={28} />, title: "Aprovacao em 24h", desc: "Processo agil e desburocratizado. Resposta rapida para voce sair dirigindo." },
    { icon: <CreditCard size={28} />, title: "Sem entrada minima", desc: "Flexibilidade para voce financiar da forma que melhor cabe no bolso." },
    { icon: <Calendar size={28} />, title: "Ate 60x", desc: "Parcelas em ate 60 meses para diminuir o valor mensal ao maximo." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Vantagens</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Por que Financiar com a Atria?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {cards.map((c) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-atria-gray-light rounded-xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-atria-navy/10 text-atria-navy flex items-center justify-center mx-auto mb-4">
                {c.icon}
              </div>
              <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark mb-2">{c.title}</h3>
              <p className="font-inter text-sm text-atria-text-gray">{c.desc}</p>
              {"disclaimer" in c && c.disclaimer && (
                <p className="font-inter text-xs text-atria-text-gray/70 italic mt-2">* Taxas sujeitas a analise de credito. Consulte condicoes.</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Como Funciona ---------------------------------------------------------
function ComoFunciona() {
  const steps = [
    { icon: <Car size={24} />, title: "Escolha o veiculo", desc: "Navegue pelo nosso estoque e encontre o carro ideal." },
    { icon: <CreditCard size={24} />, title: "Simule online", desc: "Use o simulador acima ou fale com um consultor." },
    { icon: <FileText size={24} />, title: "Envie documentos", desc: "RG, CPF, comprovante de renda e residencia." },
    { icon: <CheckCircle size={24} />, title: "Aprovacao e retirada", desc: "Aprovado? Agende a retirada e saia dirigindo!" },
  ];

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Passo a Passo</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Como Funciona
          </h2>
        </div>
        <div className="mb-10">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
            alt="Consultor atendendo cliente"
            className="w-full max-w-3xl mx-auto h-48 md:h-64 object-cover rounded-2xl shadow-md"
            loading="lazy"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white rounded-xl p-6 text-center"
            >
              <span className="absolute -top-3 -left-1 font-barlow-condensed font-black text-5xl text-atria-navy/10">{i + 1}</span>
              <div className="w-12 h-12 rounded-full bg-atria-navy text-white flex items-center justify-center mx-auto mb-4">
                {s.icon}
              </div>
              <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark mb-2">{s.title}</h3>
              <p className="font-inter text-sm text-atria-text-gray">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Bancos Parceiros ------------------------------------------------------
function BancosParceiros() {
  const bancos = ["Bradesco", "Itau", "Santander", "BV", "Pan"];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Parceiros</p>
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Bancos Parceiros
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
          {bancos.map((b) => (
            <div key={b} className="flex items-center justify-center w-36 h-20 bg-atria-gray-light rounded-xl border border-atria-gray-medium">
              <span className="font-barlow-condensed font-bold text-xl text-atria-text-gray">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- FAQ -------------------------------------------------------------------
const FAQS = [
  { q: "Quais documentos preciso para financiar?", a: "RG/CNH, CPF, comprovante de residencia atualizado e comprovante de renda (holerite, extrato bancario ou declaracao de IR)." },
  { q: "Consigo financiar com o nome negativado?", a: "Depende do caso. Trabalhamos com bancos que possuem linhas especiais. Faca uma simulacao e nosso consultor analisara as opcoes." },
  { q: "Qual a taxa de juros?", a: "As taxas variam conforme o perfil de credito, valor de entrada e prazo. Atualmente temos taxas a partir de 0.99% ao mes." },
  { q: "Posso usar meu carro como entrada?", a: "Sim! Avaliamos seu veiculo gratuitamente e o valor pode ser usado como parte do pagamento ou entrada do financiamento." },
  { q: "Em quanto tempo sai a aprovacao?", a: "Geralmente em ate 24 horas uteis. Em alguns casos, pode ser aprovado no mesmo dia." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">FAQ</p>
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Duvidas Frequentes
          </h2>
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
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5">
                      <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Credere Plugin --------------------------------------------------------
function CrederePlugin() {
  useEffect(() => {
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
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Simulacao com CPF</p>
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Simule pelo Credere
          </h2>
          <p className="font-inter text-sm text-atria-text-gray mt-2">Pre-aprovacao em 30 segundos</p>
        </div>
        <div id="credere-pnp" />
      </div>
    </section>
  );
}

// ---- CTA Final -------------------------------------------------------------
function CTAFinal() {
  return (
    <section className="py-20 bg-atria-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#002BB5_0%,_#001066_60%)]" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <Shield size={40} className="text-atria-yellow mx-auto mb-4" />
        <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-white uppercase mb-4">
          Fale com Nosso Especialista <span className="text-atria-yellow">em Financiamento</span>
        </h2>
        <p className="font-inter text-white/70 mb-8 max-w-lg mx-auto">
          Tire suas duvidas e encontre a melhor condicao para o seu perfil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={waLink("Ola! Tenho interesse em financiamento de veiculos. Podem me ajudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors"
          >
            <Send size={18} />
            Falar via WhatsApp
          </a>
          <a href="/estoque" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors">
            Ver Estoque
          </a>
        </div>
      </div>
    </section>
  );
}

// ---- Page ------------------------------------------------------------------
export default function Financiamento() {
  useSEO();

  return (
    <>
      <Hero />
      <Simulador />
      <Vantagens />
      <ComoFunciona />
      <BancosParceiros />
      <CrederePlugin />
      <FAQSection />
      <CTAFinal />
    </>
  );
}
