import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, TrendingDown, Clock, CreditCard, Calendar,
  FileText, CheckCircle, Car, Send, Shield, X,
} from "lucide-react";
import { saveLead } from "@/lib/firestore";
import { calcularFaixaParcela, SIM_PRAZO } from "@/lib/preco";

const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

// ---- SEO -------------------------------------------------------------------
import { useSEO } from "@/hooks/useSEO";
import { ROUTES } from "@/lib/constants";

function usePageSEO() {
  useSEO({
    title: "Financiamento de Seminovos em Campinas SP | Átria Veículos",
    description: "Financiamento facilitado para seminovos na Átria Veículos. Taxas a partir de 0,99%/mês, aprovação em 24h, até 60x. Simule agora!",
    path: ROUTES.financiamento,
  });
}

// ---- Hero ------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative bg-atria-navy py-20 md:py-28 overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-inter text-atria-yellow-bright text-xs uppercase tracking-widest font-bold mb-4">Financiamento</p>
          <h1 className="font-barlow-condensed font-black text-4xl md:text-6xl text-white uppercase leading-none mb-4">
            Financiamento <span className="text-atria-yellow-bright">Facilitado</span>
          </h1>
          <p className="font-inter text-white/70 text-lg max-w-xl mx-auto">
            As melhores taxas do mercado com aprovação em até 24h
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Simulador (inline) ----------------------------------------------------
const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

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

  const { precoMin, precoMax } = calcularFaixaParcela(entrada, parcela);

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
        dados: { entrada, parcela, prazo: SIM_PRAZO, precoMin, precoMax },
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
                className="w-full bg-gradient-to-b from-atria-yellow-light to-atria-yellow text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-3 rounded-full hover:brightness-95 transition-all disabled:opacity-60"
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
              className="w-full bg-gradient-to-b from-atria-yellow-light to-atria-yellow text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-full hover:brightness-95 transition-all"
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
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Simulador</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Encontre o Carro Ideal Pro Seu Plano
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
            className="w-full bg-gradient-to-b from-atria-navy-light to-atria-navy hover:brightness-110 text-white font-inter font-bold text-base uppercase tracking-wider py-4 rounded-full transition-all"
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
            source="simulador-financiamento"
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ---- Vantagens -------------------------------------------------------------
function Vantagens() {
  const cards = [
    { icon: <TrendingDown size={28} />, title: "Taxas a partir de 0,99%/mês", desc: "Trabalhamos com os melhores bancos para garantir taxas competitivas.", disclaimer: true },
    { icon: <Clock size={28} />, title: "Aprovação em 24h", desc: "Processo ágil e desburocratizado. Resposta rápida para você sair dirigindo." },
    { icon: <CreditCard size={28} />, title: "Sem entrada mínima", desc: "Flexibilidade para você financiar da forma que melhor cabe no bolso." },
    { icon: <Calendar size={28} />, title: "Até 60x", desc: "Parcelas em até 60 meses para diminuir o valor mensal ao máximo." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Vantagens</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Por que Financiar com a Átria?
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
                <p className="font-inter text-xs text-atria-text-gray/70 italic mt-2">* Taxas sujeitas a análise de crédito. Consulte condições.</p>
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
    { icon: <Car size={24} />, title: "Escolha o veículo", desc: "Navegue pelo nosso estoque e encontre o carro ideal." },
    { icon: <CreditCard size={24} />, title: "Simule online", desc: "Use o simulador acima ou fale com um consultor." },
    { icon: <FileText size={24} />, title: "Envie documentos", desc: "RG, CPF, comprovante de renda e residência." },
    { icon: <CheckCircle size={24} />, title: "Aprovação e retirada", desc: "Aprovado? Agende a retirada e saia dirigindo!" },
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
const BANCOS = [
  { nome: "Bradesco", cor: "#CC092F", logo: "/images/banks/bradesco.svg" },
  { nome: "Itaú", cor: "#003399", logo: "/images/banks/itau.svg" },
  { nome: "Santander", cor: "#EC0000", logo: "/images/banks/santander.svg" },
  { nome: "BV", cor: "#2B9B2C", logo: "/images/banks/bv.svg" },
  { nome: "Pan", cor: "#0066CC", logo: "/images/banks/pan.svg" },
  { nome: "C6", cor: "#242424", logo: "/images/banks/c6.svg" },
  { nome: "Safra", cor: "#003366", logo: "/images/banks/safra.svg" },
];

function BancosParceiros() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Parceiros</p>
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Bancos Parceiros
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {BANCOS.map((b) => (
            <div key={b.nome} className="flex items-center justify-center aspect-square bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <img
                src={b.logo}
                alt={b.nome}
                className="max-h-12 w-auto object-contain mx-auto"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector("span")) {
                    const span = document.createElement("span");
                    span.className = "font-barlow-condensed font-bold text-xl";
                    span.style.color = b.cor;
                    span.textContent = b.nome;
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
          ))}
          <div className="flex items-center justify-center aspect-square rounded-xl">
            <span className="font-inter text-sm text-atria-text-gray italic">e outros</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- FAQ -------------------------------------------------------------------
const FAQS = [
  { q: "Quais documentos preciso para financiar?", a: "RG/CNH, CPF, comprovante de residência atualizado e comprovante de renda (holerite, extrato bancário ou declaração de IR)." },
  { q: "Consigo financiar com o nome negativado?", a: "Depende do caso. Trabalhamos com bancos que possuem linhas especiais. Faça uma simulação e nosso consultor analisará as opções." },
  { q: "Qual a taxa de juros?", a: "As taxas variam conforme o perfil de crédito, valor de entrada e prazo. Atualmente temos taxas a partir de 0,99% ao mês." },
  { q: "Posso usar meu carro como entrada?", a: "Sim! Avaliamos seu veículo gratuitamente e o valor pode ser usado como parte do pagamento ou entrada do financiamento." },
  { q: "Em quanto tempo sai a aprovação?", a: "Geralmente em até 24 horas úteis. Em alguns casos, pode ser aprovado no mesmo dia." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">FAQ</p>
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Dúvidas Frequentes
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

// ---- Simulacao com CPF CTA --------------------------------------------------
function SimulacaoCPF() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Simulação com CPF</p>
        <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase mb-3">
          Pré-aprovação Online
        </h2>
        <p className="font-inter text-sm text-atria-text-gray mb-6">
          Para simulação com CPF, escolha um veículo do nosso estoque e use o simulador Credere na página do veículo.
        </p>
        <a
          href={ROUTES.estoque}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-atria-navy-light to-atria-navy hover:brightness-110 text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-colors"
        >
          <Car size={18} />
          Ver Estoque
        </a>
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
        <Shield size={40} className="text-atria-yellow-bright mx-auto mb-4" />
        <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-white uppercase mb-4">
          Fale com Nosso Especialista <span className="text-atria-yellow-bright">em Financiamento</span>
        </h2>
        <p className="font-inter text-white/70 mb-8 max-w-lg mx-auto">
          Tire suas dúvidas e encontre a melhor condição para o seu perfil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={waLink("Olá! Tenho interesse em financiamento de veículos. Podem me ajudar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-colors"
          >
            <Send size={18} />
            Falar via WhatsApp
          </a>
          <a href={ROUTES.estoque} className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-full transition-colors">
            Ver Estoque
          </a>
        </div>
      </div>
    </section>
  );
}

// ---- Page ------------------------------------------------------------------
export default function Financiamento() {
  usePageSEO();

  return (
    <>
      <Hero />
      <Simulador />
      <Vantagens />
      <ComoFunciona />
      <BancosParceiros />
      <SimulacaoCPF />
      <FAQSection />
      <CTAFinal />
    </>
  );
}
