import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car, DollarSign, Clock, Users, ShieldCheck, Camera,
  FileText, CheckCircle, ArrowRight, Phone, MapPin,
  TrendingUp, Handshake, Send,
} from "lucide-react";
import { saveLead } from "@/lib/firestore";

const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

// Round-robin entre os 2 consignadores. Alterna a cada clique pra balancear leads.
const CONSIGNACAO_NUMBERS = ["5519953216269", "5519971456051"];
const CONSIGNACAO_LS_KEY = "atria_consignacao_idx";

function nextConsignacaoNumber(): string {
  let idx = 0;
  try {
    const stored = Number(localStorage.getItem(CONSIGNACAO_LS_KEY));
    idx = Number.isFinite(stored) ? (stored + 1) % CONSIGNACAO_NUMBERS.length : 0;
    localStorage.setItem(CONSIGNACAO_LS_KEY, String(idx));
  } catch {
    idx = Math.floor(Math.random() * CONSIGNACAO_NUMBERS.length);
  }
  return CONSIGNACAO_NUMBERS[idx];
}

function openConsignacaoWa(msg: string) {
  const num = nextConsignacaoNumber();
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

// ---- SEO ----------------------------------------------------------------
import { useSEO } from "@/hooks/useSEO";
import { ROUTES } from "@/lib/constants";

function usePageSEO() {
  useSEO({
    title: "Venda seu Carro Usado em Campinas SP | Compra Imediata | Átria Veículos",
    description: "Venda seu carro em Campinas com a Átria Veículos. Receba proposta de compra imediata ou venda por consignação com apoio profissional.",
    path: ROUTES.venderCarro,
  });
}

// ---- Hero ---------------------------------------------------------------
function Hero() {
  return (
    <section className="relative bg-atria-navy overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-atria-navy via-[#001060] to-[#000b40] opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJIMTZ2LTJoMnYtMmgydi0yaDJ2MmgydjJoMnYyaC0ydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <span className="inline-block bg-atria-yellow/20 text-atria-yellow-bright font-inter font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Compra ou Consignação
          </span>
          <h1 className="font-barlow-condensed font-black text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
            Venda seu carro do jeito que fizer mais sentido
          </h1>
          <p className="font-inter text-lg text-white/70 mt-4 max-w-2xl mx-auto">
            Receba proposta de compra imediata ou venda por consignação com apoio da Átria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href="#formulario-compra"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 text-atria-navy font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-colors"
            >
              <DollarSign size={18} />
              Quero proposta de compra
            </a>
            <a
              href="#consignacao"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-colors"
            >
              <Handshake size={18} />
              Quero vender por consignação
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Comparison Table ---------------------------------------------------
function ComparisonTable() {
  const rows = [
    { label: "Melhor para", compra: "Quem quer rapidez", consignacao: "Quem quer melhor valor" },
    { label: "Valor potencial", compra: "Menor (a Átria assume risco)", consignacao: "Maior (preço de mercado)" },
    { label: "Prazo", compra: "Mais curto", consignacao: "Pode levar mais tempo" },
    { label: "Quem cuida da venda", compra: "Átria compra direto", consignacao: "Átria vende para terceiro" },
    { label: "Você precisa fazer", compra: "Trazer o carro pra avaliação", consignacao: "Trazer o carro pra avaliação" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Compare as duas opções
          </h2>
          <p className="font-inter text-atria-text-gray mt-2">Escolha o que faz mais sentido pra você.</p>
        </motion.div>

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden md:block max-w-4xl mx-auto"
        >
          <div className="rounded-xl border border-atria-gray-medium overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-atria-gray-light">
                  <th className="font-inter font-semibold text-sm text-atria-text-gray uppercase tracking-wider text-left px-6 py-4 w-1/3" />
                  <th className="font-barlow-condensed font-bold text-lg text-atria-navy uppercase px-6 py-4 w-1/3">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign size={20} />
                      Compra
                    </div>
                  </th>
                  <th className="font-barlow-condensed font-bold text-lg text-atria-navy uppercase px-6 py-4 w-1/3 bg-blue-50">
                    <div className="flex items-center justify-center gap-2">
                      <Handshake size={20} />
                      Consignação
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-atria-gray-light/50"}>
                    <td className="font-inter font-semibold text-sm text-atria-text-dark px-6 py-4">{row.label}</td>
                    <td className="font-inter text-sm text-atria-text-gray text-center px-6 py-4">{row.compra}</td>
                    <td className="font-inter text-sm text-atria-text-gray text-center px-6 py-4 bg-blue-50/50">{row.consignacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {[
            { title: "Compra", icon: <DollarSign size={20} />, data: rows.map(r => ({ label: r.label, value: r.compra })), accent: false },
            { title: "Consignação", icon: <Handshake size={20} />, data: rows.map(r => ({ label: r.label, value: r.consignacao })), accent: true },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-xl border p-5 ${card.accent ? "border-atria-navy bg-blue-50/50" : "border-atria-gray-medium bg-white"}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-atria-navy">{card.icon}</span>
                <h3 className="font-barlow-condensed font-bold text-xl text-atria-navy uppercase">{card.title}</h3>
              </div>
              <div className="space-y-3">
                {card.data.map((item) => (
                  <div key={item.label}>
                    <p className="font-inter text-xs text-atria-text-gray uppercase tracking-wider">{item.label}</p>
                    <p className="font-inter text-sm text-atria-text-dark font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA below table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="font-inter text-atria-text-gray mb-4">
            Não sabe qual faz mais sentido? A gente avalia e te orienta.
          </p>
          <a
            href={waLink("Olá! Quero vender meu carro mas não sei se compra ou consignação é melhor pra mim. Podem me orientar?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 text-white font-inter font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
          >
            <Phone size={16} />
            Falar com um consultor
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Consignment Block --------------------------------------------------
const BENEFITS = [
  { icon: <DollarSign size={20} />, title: "Sem custo até vender", desc: "Você só paga comissão quando o carro for vendido." },
  { icon: <Camera size={20} />, title: "Exposição profissional", desc: "Seu carro aparece no site, redes sociais e portais como OLX e Webmotors." },
  { icon: <TrendingUp size={20} />, title: "Avaliação justa", desc: "Precificação baseada em dados de mercado (FIPE + demanda real)." },
  { icon: <ShieldCheck size={20} />, title: "Sem dor de cabeça", desc: "A Átria cuida de foto, anúncio, atendimento, test-drive, documentação e entrega." },
  { icon: <FileText size={20} />, title: "Contrato transparente", desc: "Prazo, valor mínimo e comissão definidos antes de começar." },
];

const STEPS = [
  { num: "1", title: "Peça uma avaliação", desc: "Pelo formulário ou WhatsApp" },
  { num: "2", title: "A Átria avalia o carro", desc: "E propõe as condições" },
  { num: "3", title: "A Átria anuncia e cuida de tudo", desc: "Fotos, anúncios, atendimento" },
  { num: "4", title: "Carro vendido", desc: "Você recebe o valor combinado" },
];

function ConsignmentBlock() {
  return (
    <section id="consignacao" className="py-16 bg-gradient-to-b from-blue-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-atria-navy/10 text-atria-navy font-inter font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Recomendado
          </span>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Consignação: venda pelo melhor valor com apoio da Átria
          </h2>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-14">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-atria-gray-medium rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-atria-navy/10 text-atria-navy mb-3">
                {b.icon}
              </span>
              <h3 className="font-inter font-bold text-sm text-atria-text-dark mb-1">{b.title}</h3>
              <p className="font-inter text-sm text-atria-text-gray">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Process steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark uppercase tracking-wide text-center mb-8">
            Como funciona
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-atria-navy text-white font-barlow-condensed font-black text-xl mb-3">
                  {step.num}
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={16} className="hidden lg:block absolute top-5 -right-3 text-atria-navy/30" />
                )}
                <h4 className="font-inter font-bold text-sm text-atria-text-dark">{step.title}</h4>
                <p className="font-inter text-xs text-atria-text-gray mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button
            type="button"
            onClick={() => openConsignacaoWa("Olá! Quero saber mais sobre consignação do meu carro.")}
            className="inline-flex items-center gap-2 bg-gradient-to-b from-atria-navy-light to-atria-navy hover:brightness-110 text-white font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-colors shadow-lg shadow-atria-navy/20"
          >
            <Handshake size={18} />
            Quero consignar meu carro
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Purchase Form Block (Multi-step) -----------------------------------
type PurchaseStep = 1 | 2 | 3;

function PurchaseForm() {
  const [step, setStep] = useState<PurchaseStep>(1);
  const [form, setForm] = useState({ nome: "", whatsapp: "", marcaModelo: "", ano: "", km: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const goNext = () => setStep((s) => (s < 3 ? ((s + 1) as PurchaseStep) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as PurchaseStep) : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp || !form.marcaModelo) return;
    setSending(true);
    try {
      await saveLead({
        source: "venda-seu-carro-compra",
        whatsapp: form.whatsapp,
        query: `${form.marcaModelo} ${form.ano} ${form.km}km`,
        dados: { nome: form.nome, marcaModelo: form.marcaModelo, ano: form.ano, km: form.km },
      });
      setSent(true);
      setTimeout(() => {
        window.open(
          waLink(`Olá! Quero vender meu carro. ${form.marcaModelo} ${form.ano} ${form.km}km. Meu nome é ${form.nome}, WhatsApp: ${form.whatsapp}`),
          "_blank"
        );
      }, 500);
    } catch {
      window.open(
        waLink(`Olá! Quero vender meu carro. ${form.marcaModelo} ${form.ano} ${form.km}km. Meu nome é ${form.nome}, WhatsApp: ${form.whatsapp}`),
        "_blank"
      );
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  // Validações por etapa
  const canAdvance1 = form.marcaModelo.trim().length > 1;
  const canAdvance2 = true; // ano e km são opcionais
  const canSubmit = form.nome.trim().length > 1 && form.whatsapp.trim().length >= 8;

  const inputClass = "w-full border border-atria-gray-medium rounded-lg px-4 py-3 font-inter text-sm text-atria-text-dark placeholder-atria-text-gray/50 focus:outline-none focus:border-atria-navy transition-colors";
  const labelClass = "font-inter text-xs font-semibold text-atria-text-gray uppercase tracking-wider block mb-1.5";

  return (
    <section id="formulario-compra" className="py-16 bg-atria-gray-light scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
              Quer vender rápido?
            </h2>
            <p className="font-inter text-atria-text-gray mt-2">
              A Átria faz uma proposta de compra em até 24h. Leva 30 segundos.
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-green-200 rounded-xl p-8 text-center"
            >
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="font-barlow-condensed font-bold text-2xl text-atria-text-dark">Dados recebidos!</h3>
              <p className="font-inter text-atria-text-gray mt-2">
                Nosso time vai analisar e entrar em contato pelo WhatsApp em até 24h.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-atria-gray-medium rounded-xl p-6 md:p-8">
              {/* Barra de progresso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-inter text-xs font-semibold text-atria-text-gray uppercase tracking-wider">
                    Passo {step} de 3
                  </span>
                  <span className="font-inter text-xs text-atria-text-gray">
                    {step === 1 ? "Sobre o carro" : step === 2 ? "Detalhes" : "Seu contato"}
                  </span>
                </div>
                <div className="h-1.5 bg-atria-gray-medium rounded-full overflow-hidden">
                  <div
                    className="h-full bg-atria-navy rounded-full transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Etapa 1: marca/modelo */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className={labelClass}>Qual carro você quer vender?</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.marcaModelo}
                      onChange={handleChange("marcaModelo")}
                      placeholder="Ex: Honda Civic EXL"
                      className={inputClass}
                    />
                    <p className="font-inter text-xs text-atria-text-gray mt-2">
                      Marca, modelo e versão se souber. Ex: Honda Civic EXL ou Toyota Corolla XEi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance1}
                    className="w-full bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-full transition-all"
                  >
                    Continuar →
                  </button>
                </motion.div>
              )}

              {/* Etapa 2: ano + km */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ano</label>
                      <input
                        type="text"
                        autoFocus
                        value={form.ano}
                        onChange={handleChange("ano")}
                        placeholder="2021"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Quilometragem aproximada</label>
                      <input
                        type="text"
                        value={form.km}
                        onChange={handleChange("km")}
                        placeholder="45.000"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <p className="font-inter text-xs text-atria-text-gray">
                    Se não souber exato, sem problema — pode aproximar.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 bg-white border border-atria-gray-medium hover:bg-atria-gray-light text-atria-text-dark font-inter font-semibold text-sm uppercase tracking-wider py-4 rounded-full transition-all"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canAdvance2}
                      className="flex-[2] bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 disabled:opacity-50 text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-full transition-all"
                    >
                      Continuar →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Etapa 3: nome + whatsapp */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="font-inter text-xs text-atria-navy">
                      <strong>Falta só seu contato</strong> pra enviar a proposta. Não enviamos spam.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Seu nome *</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.nome}
                      onChange={handleChange("nome")}
                      placeholder="João Silva"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={form.whatsapp}
                      onChange={handleChange("whatsapp")}
                      placeholder="(19) 99652-5211"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 bg-white border border-atria-gray-medium hover:bg-atria-gray-light text-atria-text-dark font-inter font-semibold text-sm uppercase tracking-wider py-4 rounded-full transition-all"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || sending}
                      className="flex-[2] bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 disabled:opacity-50 text-atria-navy font-inter font-bold text-sm uppercase tracking-wider py-4 rounded-full transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      {sending ? "Enviando..." : "Receber proposta"}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ---- Social Proof -------------------------------------------------------
function SocialProof() {
  const stats = [
    { value: "10.000+", label: "carros vendidos" },
    { value: "12", label: "anos de mercado" },
    { value: "3", label: "lojas em Campinas" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-atria-navy rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-barlow-condensed font-black text-4xl md:text-5xl text-atria-yellow-bright">{s.value}</p>
                <p className="font-inter text-white/70 text-sm mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8 text-white/60">
            <MapPin size={16} />
            <span className="font-inter text-sm">Avaliação presencial sem compromisso em qualquer uma das nossas lojas</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Bottom CTA ---------------------------------------------------------
function BottomCTA() {
  return (
    <section className="py-16 bg-atria-gray-light">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-barlow-condensed font-black text-3xl text-atria-text-dark uppercase">
            Pronto pra vender?
          </h2>
          <p className="font-inter text-atria-text-gray mt-2 mb-6">
            Escolha a opção que faz mais sentido e fale com a gente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#formulario-compra"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-atria-yellow-light to-atria-yellow hover:brightness-105 text-atria-navy font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-colors"
            >
              <DollarSign size={18} />
              Proposta de compra
            </a>
            <button
              type="button"
              onClick={() => openConsignacaoWa("Olá! Quero saber mais sobre consignação do meu carro.")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-b from-atria-navy-light to-atria-navy hover:brightness-110 text-white font-inter font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full transition-colors"
            >
              <Handshake size={18} />
              Consignar meu carro
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Page ---------------------------------------------------------------
export default function VendaSeuCarro() {
  usePageSEO();

  return (
    <>
      <Hero />
      <ComparisonTable />
      <ConsignmentBlock />
      <PurchaseForm />
      <SocialProof />
      <BottomCTA />
    </>
  );
}
